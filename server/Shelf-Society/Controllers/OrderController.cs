// Controllers/OrderController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Data;
using Shelf_Society.Helpers;
using Shelf_Society.Models.DTOs.Order;
using Shelf_Society.Models.Entities;
using Shelf_Society.Services;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Shelf_Society.Controllers
{
  [ApiController]
  [Route("api/orders")]
  [Authorize] // Only authenticated users can access orders
  public class OrderController : ControllerBase
  {
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    public OrderController(ApplicationDbContext context, IEmailService emailService)
    {
      _context = context;
      _emailService = emailService;
    }

    // Get list of user's orders
    [HttpGet]
    public async Task<ActionResult<ResponseHelper<PaginationHelper<OrderListItemDTO>>>> GetOrders(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      var query = _context.Orders
          .Where(o => o.UserId == userId)
          .OrderByDescending(o => o.OrderDate)
          .AsQueryable();

      // Apply pagination
      var pagedOrders = await PaginationHelper<Order>.CreateAsync(query, pageNumber, pageSize);

      // Map to DTOs
      var orderDtos = pagedOrders.Items.Select(o => new OrderListItemDTO
      {
        Id = o.Id,
        ClaimCode = o.ClaimCode,
        Status = o.Status.ToString(),
        TotalItems = _context.OrderItems.Where(oi => oi.OrderId == o.Id).Sum(oi => oi.Quantity),
        FinalAmount = o.FinalAmount,
        OrderDate = o.OrderDate,
        CanCancel = o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed
      }).ToList();

      // Create final response with pagination
      var pagedResponse = new PaginationHelper<OrderListItemDTO>(
          orderDtos,
          pagedOrders.TotalCount,
          pagedOrders.PageNumber,
          pagedOrders.PageSize);

      return Ok(new ResponseHelper<PaginationHelper<OrderListItemDTO>>
      {
        Success = true,
        Message = "Orders retrieved successfully",
        Data = pagedResponse
      });
    }

    // Get order details by id
    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseHelper<OrderResponseDTO>>> GetOrderById(int id)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      var order = await _context.Orders
          .Include(o => o.Items)
          .ThenInclude(oi => oi.Book)
          .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

      if (order == null)
      {
        return NotFound(new ResponseHelper<OrderResponseDTO>
        {
          Success = false,
          Message = "Order not found",
          Data = null
        });
      }

      var orderDto = new OrderResponseDTO
      {
        Id = order.Id,
        ClaimCode = order.ClaimCode,
        Status = order.Status.ToString(),
        TotalAmount = order.TotalAmount,
        DiscountPercentage = order.DiscountPercentage,
        DiscountAmount = order.DiscountAmount,
        FinalAmount = order.FinalAmount,
        OrderDate = order.OrderDate,
        CancelledDate = order.CancelledDate,
        CompletedDate = order.CompletedDate,
        CanCancel = order.Status == OrderStatus.Pending || order.Status == OrderStatus.Confirmed,
        Items = order.Items.Select(oi => new OrderItemDTO
        {
          Id = oi.Id,
          BookId = oi.BookId,
          Title = oi.Book.Title,
          Author = oi.Book.Author,
          ImageUrl = oi.Book.ImageUrl,
          Quantity = oi.Quantity,
          Price = oi.Price,
          Subtotal = oi.Subtotal
        }).ToList(),
        TotalItems = order.Items.Sum(oi => oi.Quantity)
      };

      return Ok(new ResponseHelper<OrderResponseDTO>
      {
        Success = true,
        Message = "Order retrieved successfully",
        Data = orderDto
      });
    }

    // Place a new order from cart
    [HttpPost]
    public async Task<ActionResult<ResponseHelper<OrderResponseDTO>>> PlaceOrder(PlaceOrderDTO dto)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      // Check if user has a cart
      var cart = await _context.Carts
          .FirstOrDefaultAsync(c => c.UserId == userId);

      if (cart == null)
      {
        return BadRequest(new ResponseHelper<OrderResponseDTO>
        {
          Success = false,
          Message = "Your cart is empty",
          Data = null
        });
      }

      // Get cart items
      var cartItems = await _context.CartItems
          .Include(ci => ci.Book)
          .Where(ci => ci.CartId == cart.Id)
          .ToListAsync();

      if (cartItems.Count == 0)
      {
        return BadRequest(new ResponseHelper<OrderResponseDTO>
        {
          Success = false,
          Message = "Your cart is empty",
          Data = null
        });
      }

      // Verify all items are available in requested quantities
      foreach (var item in cartItems)
      {
        if (!item.Book.IsAvailable || item.Book.StockQuantity < item.Quantity)
        {
          return BadRequest(new ResponseHelper<OrderResponseDTO>
          {
            Success = false,
            Message = $"Item '{item.Book.Title}' is not available in the requested quantity",
            Data = null
          });
        }
      }

      // Calculate order totals
      decimal totalAmount = cartItems.Sum(ci => ci.Book.Price * ci.Quantity);

      // Apply discounts
      decimal discountPercentage = 0;
      int totalItems = cartItems.Sum(ci => ci.Quantity);

      // Apply 5% discount for orders with 5+ books
      if (totalItems >= 5)
      {
        discountPercentage = 5;
      }

      // Check if user qualifies for 10% loyalty discount (10 or more completed orders)
      var completedOrdersCount = await _context.Orders
          .CountAsync(o => o.UserId == userId && o.Status == OrderStatus.Completed);

      if (completedOrdersCount >= 10)
      {
        discountPercentage += 10;
      }

      decimal discountAmount = totalAmount * (discountPercentage / 100m);
      decimal finalAmount = totalAmount - discountAmount;

      // Generate a unique claim code (6 alphanumeric characters)
      string claimCode = GenerateClaimCode();

      // Create the order
      var order = new Order
      {
        UserId = userId,
        ClaimCode = claimCode,
        Status = OrderStatus.Pending,
        TotalAmount = totalAmount,
        DiscountPercentage = discountPercentage,
        DiscountAmount = discountAmount,
        FinalAmount = finalAmount,
        OrderDate = DateTime.UtcNow,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
      };

      _context.Orders.Add(order);
      var user = await _context.Users.FindAsync(userId);
      await _emailService.SendOrderConfirmationEmailAsync(order, user);
      await _context.SaveChangesAsync();

      // Create order items
      foreach (var cartItem in cartItems)
      {
        var orderItem = new OrderItem
        {
          OrderId = order.Id,
          BookId = cartItem.BookId,
          Quantity = cartItem.Quantity,
          Price = cartItem.Book.Price,
          Subtotal = cartItem.Book.Price * cartItem.Quantity,
          CreatedAt = DateTime.UtcNow
        };

        _context.OrderItems.Add(orderItem);

        // Update book stock quantity
        cartItem.Book.StockQuantity -= cartItem.Quantity;
      }

      // Clear the cart
      _context.CartItems.RemoveRange(cartItems);

      await _context.SaveChangesAsync();

      // Return the created order
      return await GetOrderById(order.Id);
    }

    // Cancel an order
    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<ResponseHelper<OrderResponseDTO>>> CancelOrder(int id)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      var order = await _context.Orders
          .Include(o => o.Items)
          .ThenInclude(oi => oi.Book)
          .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

      if (order == null)
      {
        return NotFound(new ResponseHelper<OrderResponseDTO>
        {
          Success = false,
          Message = "Order not found",
          Data = null
        });
      }

      // Check if order can be cancelled
      if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
      {
        return BadRequest(new ResponseHelper<OrderResponseDTO>
        {
          Success = false,
          Message = "This order cannot be cancelled",
          Data = null
        });
      }

      // Update order status
      order.Status = OrderStatus.Cancelled;
      order.CancelledDate = DateTime.UtcNow;
      order.UpdatedAt = DateTime.UtcNow;

      // Restore book quantities
      foreach (var item in order.Items)
      {
        item.Book.StockQuantity += item.Quantity;
      }

      await _context.SaveChangesAsync();

      // Return the updated order
      return await GetOrderById(order.Id);
    }

    // Generate a random 6-character alphanumeric claim code
    private string GenerateClaimCode()
    {
      const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      var random = new Random();

      while (true)
      {
        var code = new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());

        // Check if code is unique
        var codeExists = _context.Orders.Any(o => o.ClaimCode == code);
        if (!codeExists)
        {
          return code;
        }
      }
    }
  }
}
