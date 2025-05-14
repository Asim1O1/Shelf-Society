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
using System.Collections.Generic;
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

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("list/all")] // Changed from "/order-list" to "list/all" to fit within the controller's route pattern
    public async Task<ActionResult<ResponseHelper<PaginationHelper<OrderListItemDTO>>>> GetAllOrders(
       [FromQuery] string status = null,
       [FromQuery] string search = null,
       [FromQuery] DateTime? startDate = null,
       [FromQuery] DateTime? endDate = null,
       [FromQuery] int pageNumber = 1,
       [FromQuery] int pageSize = 10)
    {
      // Start with all orders
      var query = _context.Orders
          .Include(o => o.User)
          .AsQueryable();

      // Apply status filter if provided
      if (!string.IsNullOrEmpty(status) && status != "All")
      {
        if (Enum.TryParse<OrderStatus>(status, out var orderStatus))
        {
          query = query.Where(o => o.Status == orderStatus);
        }
      }

      // Apply date range filters if provided
      if (startDate.HasValue)
      {
        query = query.Where(o => o.OrderDate >= startDate.Value);
      }

      if (endDate.HasValue)
      {
        // Add one day to include the entire end date
        var nextDay = endDate.Value.AddDays(1);
        query = query.Where(o => o.OrderDate < nextDay);
      }

      // Apply search if provided
      if (!string.IsNullOrEmpty(search))
      {
        search = search.ToLower();

        // Try to parse as integer for order ID search
        if (int.TryParse(search, out var orderId))
        {
          query = query.Where(o => o.Id == orderId);
        }
        else
        {
          // Search in claim code, customer name and email
          query = query.Where(o =>
              o.ClaimCode.ToLower().Contains(search) ||
              o.User.FirstName.ToLower().Contains(search) ||
              o.User.LastName.ToLower().Contains(search) ||
              o.User.Email.ToLower().Contains(search)
          );
        }
      }

      // Default to newest first
      query = query.OrderByDescending(o => o.OrderDate);

      // Apply pagination
      var pagedOrders = await PaginationHelper<Order>.CreateAsync(query, pageNumber, pageSize);

      // Map to DTOs
      var orderDtos = new List<OrderListItemDTO>();

      foreach (var order in pagedOrders.Items)
      {
        // Get top item names for this order (limit to 3 for display)
        var itemNames = await _context.OrderItems
            .Where(oi => oi.OrderId == order.Id)
            .Include(oi => oi.Book)
            .Select(oi => new
            {
              Title = oi.Book.Title,
              Quantity = oi.Quantity
            })
            .Take(3)  // Limit to top 3 items
            .ToListAsync();

        var dto = new OrderListItemDTO
        {
          Id = order.Id,
          ClaimCode = order.ClaimCode,
          Status = order.Status.ToString(),
          TotalItems = await _context.OrderItems.Where(oi => oi.OrderId == order.Id).SumAsync(oi => oi.Quantity),
          FinalAmount = order.FinalAmount,
          OrderDate = order.OrderDate,
          CanCancel = order.Status == OrderStatus.Pending || order.Status == OrderStatus.Confirmed,
          ItemNames = itemNames.Select(item => $"{item.Quantity}× {item.Title}").ToList(),
          // Include customer information for staff view
          CustomerName = $"{order.User.FirstName} {order.User.LastName}",
          CustomerEmail = order.User.Email
        };

        orderDtos.Add(dto);
      }

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
      var orderDtos = new List<OrderListItemDTO>();

      foreach (var order in pagedOrders.Items)
      {
        // Get top item names for this order (limit to 3 for display)
        var itemNames = await _context.OrderItems
            .Where(oi => oi.OrderId == order.Id)
            .Include(oi => oi.Book)
            .Select(oi => new
            {
              Title = oi.Book.Title,
              Quantity = oi.Quantity
            })
            .Take(3)  // Limit to top 3 items
            .ToListAsync();

        var dto = new OrderListItemDTO
        {
          Id = order.Id,
          ClaimCode = order.ClaimCode,
          Status = order.Status.ToString(),
          TotalItems = await _context.OrderItems.Where(oi => oi.OrderId == order.Id).SumAsync(oi => oi.Quantity), // Fixed to use async version
          FinalAmount = order.FinalAmount,
          OrderDate = order.OrderDate,
          CanCancel = order.Status == OrderStatus.Pending || order.Status == OrderStatus.Confirmed,
          ItemNames = itemNames.Select(item => $"{item.Quantity}× {item.Title}").ToList()
        };

        orderDtos.Add(dto);
      }

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


    [HttpPost]

    public async Task<ActionResult<ResponseHelper<OrderResponseDTO>>> PlaceOrder(PlaceOrderDTO dto)
    {
      try
      {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

        // Check if user has a cart
        var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == userId);
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

        // Check stock availability
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

        // Calculate totals and discounts
        decimal totalAmount = cartItems.Sum(ci => ci.Book.Price * ci.Quantity);
        int totalItems = cartItems.Sum(ci => ci.Quantity);
        decimal discountPercentage = totalItems >= 5 ? 5 : 0;

        var completedOrdersCount = await _context.Orders
            .CountAsync(o => o.UserId == userId && o.Status == OrderStatus.Completed);

        if (completedOrdersCount >= 10)
        {
          discountPercentage += 10;
        }

        decimal discountAmount = totalAmount * (discountPercentage / 100m);
        decimal finalAmount = totalAmount - discountAmount;
        string claimCode = GenerateClaimCode();

        // Create order
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
        await _context.SaveChangesAsync();

        // Create order items and update stock
        var orderItems = new List<OrderItem>();
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

          orderItems.Add(orderItem);
          _context.OrderItems.Add(orderItem);
          cartItem.Book.StockQuantity -= cartItem.Quantity;
        }

        // Send email with order items details
        try
        {
          var user = await _context.Users.FindAsync(userId);
          if (user != null)
          {
            // Create a list of order item details for the email
            var orderItemDetails = cartItems.Select(ci => new OrderItemDetailDTO
            {
              Title = ci.Book.Title,
              Quantity = ci.Quantity,
              Price = ci.Book.Price,
              Subtotal = ci.Book.Price * ci.Quantity
            }).ToList();
            foreach (var item in orderItemDetails)
            {
              Console.WriteLine($"[DTO] Title: {item.Title}, Quantity: {item.Quantity}, Price: {item.Price}, Subtotal: {item.Subtotal}");
            }


            await _emailService.SendOrderConfirmationEmailAsync(order, user, orderItemDetails);
          }
        }
        catch (Exception emailEx)
        {
          // Log email sending failure, don't interrupt the order placement
          Console.WriteLine($"Failed to send confirmation email: {emailEx.Message}");
        }

        // Clear cart
        _context.CartItems.RemoveRange(cartItems);
        await _context.SaveChangesAsync();

        // Return order response
        return await GetOrderById(order.Id);
      }
      catch (Exception ex)
      {
        // Global catch for any unexpected errors
        Console.WriteLine($"Order placement failed: {ex.Message}");

        return StatusCode(500, new ResponseHelper<OrderResponseDTO>
        {
          Success = false,
          Message = "An unexpected error occurred while placing the order.",
          Data = null
        });
      }
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
