// Controllers/StaffController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Data;
using Shelf_Society.Helpers;
using Shelf_Society.Hubs;
using Shelf_Society.Models.DTOs.Order;
using Shelf_Society.Models.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shelf_Society.Controllers
{
  [ApiController]
  [Route("api/staff")]
  [Authorize(Roles = "Admin,Staff")] // Only staff and admin can access
  public class StaffController : ControllerBase
  {
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<OrderHub> _orderHub; // Add this

    public StaffController(ApplicationDbContext context, IHubContext<OrderHub> orderHub) // Update constructor
    {
      _context = context;
      _orderHub = orderHub;
    }

    // Process a claim code
    [HttpGet("orders/claim/{claimCode}")]
    public async Task<ActionResult<ResponseHelper<OrderResponseDTO>>> GetOrderByClaimCode(string claimCode)
    {
      // Existing code - no changes needed
      var order = await _context.Orders
          .Include(o => o.Items)
          .ThenInclude(oi => oi.Book)
          .Include(o => o.User)
          .FirstOrDefaultAsync(o => o.ClaimCode == claimCode);

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

    // Update order status
    [HttpPut("orders/{id}/status")]
    public async Task<ActionResult<ResponseHelper<OrderResponseDTO>>> UpdateOrderStatus(
        int id,
        [FromBody] UpdateOrderStatusDTO dto)
    {
      // Log method entry
      Console.WriteLine($"[{DateTime.UtcNow}] UpdateOrderStatus called for OrderId: {id}, Status: {dto.Status}");

      var order = await _context.Orders
          .Include(o => o.Items)
          .ThenInclude(oi => oi.Book)
          .Include(o => o.User) // Add user info for notification
          .FirstOrDefaultAsync(o => o.Id == id);

      if (order == null)
      {
        Console.WriteLine($"[{DateTime.UtcNow}] Order {id} not found");
        return NotFound(new ResponseHelper<OrderResponseDTO>
        {
          Success = false,
          Message = "Order not found",
          Data = null
        });
      }

      Console.WriteLine($"[{DateTime.UtcNow}] Order {id} found - current status: {order.Status}, requested status: {dto.Status}");

      // Validate status transition
      if (!IsValidStatusTransition(order.Status, dto.Status))
      {
        Console.WriteLine($"[{DateTime.UtcNow}] Invalid status transition from {order.Status} to {dto.Status}");
        return BadRequest(new ResponseHelper<OrderResponseDTO>
        {
          Success = false,
          Message = "Invalid status transition",
          Data = null
        });
      }

      // Save previous status to check if this is a newly completed order
      var previousStatus = order.Status;

      // Update order status
      var newStatus = Enum.Parse<OrderStatus>(dto.Status);
      order.Status = newStatus;
      order.UpdatedAt = DateTime.UtcNow;

      Console.WriteLine($"[{DateTime.UtcNow}] Updated order status from {previousStatus} to {newStatus}");

      // Handle order completion with real-time notification
      if (newStatus == OrderStatus.Completed)
      {
        Console.WriteLine($"[{DateTime.UtcNow}] Order is being completed, setting CompletedDate");
        order.CompletedDate = DateTime.UtcNow;

        // Only broadcast if this is a newly completed order
        if (previousStatus != OrderStatus.Completed)
        {
          Console.WriteLine($"[{DateTime.UtcNow}] Order is newly completed, preparing to broadcast notification");

          // Check if SignalR hub is available
          if (_orderHub == null)
          {
            Console.WriteLine($"[{DateTime.UtcNow}] ERROR: _orderHub is null! SignalR hub was not properly injected.");
          }
          else
          {
            Console.WriteLine($"[{DateTime.UtcNow}] _orderHub is available, preparing broadcast data");

            // Count books for logging
            var bookCount = order.Items.Sum(oi => oi.Quantity);
            Console.WriteLine($"[{DateTime.UtcNow}] Order contains {bookCount} book(s) and {order.Items.Count} unique titles");

            try
            {
              // Create the broadcast data
              var broadcastData = new
              {
                OrderId = order.Id,
                CustomerName = $"{order.User.FirstName} {order.User.LastName}",
                TotalItems = order.Items.Sum(oi => oi.Quantity),
                FinalAmount = order.FinalAmount,
                Books = order.Items.Select(oi => new
                {
                  BookId = oi.BookId,
                  Title = oi.Book.Title,
                  Author = oi.Book.Author,
                  Quantity = oi.Quantity
                }).ToList(),
                Message = $"Order #{order.Id} with {order.Items.Sum(oi => oi.Quantity)} book(s) has been successfully completed!",
                CompletedAt = order.CompletedDate.Value
              };

              Console.WriteLine($"[{DateTime.UtcNow}] Broadcast data prepared for OrderId: {order.Id}, attempting to send to SignalR clients");

              // Broadcast to all connected clients
              await _orderHub.Clients.All.SendAsync("OrderCompleted", broadcastData);

              Console.WriteLine($"[{DateTime.UtcNow}] Broadcast completed successfully! Message sent to all connected clients.");
            }
            catch (Exception ex)
            {
              // Log the exception but continue processing the order update
              Console.WriteLine($"[{DateTime.UtcNow}] ERROR during broadcast: {ex.Message}");
              Console.WriteLine($"[{DateTime.UtcNow}] Exception details: {ex.ToString()}");
            }
          }
        }
        else
        {
          Console.WriteLine($"[{DateTime.UtcNow}] Order was already completed - no broadcast needed");
        }
      }

      Console.WriteLine($"[{DateTime.UtcNow}] Saving changes to database");
      await _context.SaveChangesAsync();
      Console.WriteLine($"[{DateTime.UtcNow}] Database update completed successfully");

      // Return updated order details
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

      Console.WriteLine($"[{DateTime.UtcNow}] UpdateOrderStatus method completed successfully for OrderId: {id}");
      return Ok(new ResponseHelper<OrderResponseDTO>
      {
        Success = true,
        Message = "Order status updated successfully",
        Data = orderDto
      });
    }
    [HttpGet("dashboard/stats")]
    public async Task<ActionResult<ResponseHelper<DashboardStatsDTO>>> GetDashboardStats()
    {
      var today = DateTime.UtcNow.Date;

      var orders = _context.Orders.AsQueryable();

      var stats = new DashboardStatsDTO
      {
        PendingOrders = await orders.CountAsync(o => o.Status == OrderStatus.Pending),
        ConfirmedOrders = await orders.CountAsync(o => o.Status == OrderStatus.Confirmed),
        ReadyOrders = await orders.CountAsync(o => o.Status == OrderStatus.Ready),
        CompletedOrders = await orders.CountAsync(o => o.Status == OrderStatus.Completed),
        CancelledOrders = await orders.CountAsync(o => o.Status == OrderStatus.Cancelled),
        TotalOrders = await orders.CountAsync(),
        TodayOrders = await orders.CountAsync(o => o.OrderDate.Date == today),
        TodayRevenue = await orders
              .Where(o => o.Status == OrderStatus.Completed && o.CompletedDate.HasValue && o.CompletedDate.Value.Date == today)
              .SumAsync(o => (decimal?)o.FinalAmount) ?? 0
      };

      return Ok(new ResponseHelper<DashboardStatsDTO>
      {
        Success = true,
        Message = "Dashboard stats retrieved successfully",
        Data = stats
      });
    }
    // In StaffController.cs
    [HttpGet("orders/{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ResponseHelper<OrderResponseDTO>>> GetOrderById(int id)
    {
      var order = await _context.Orders
          .Include(o => o.Items)
          .ThenInclude(oi => oi.Book)
          .Include(o => o.User) // Include user info for staff to verify identity
          .FirstOrDefaultAsync(o => o.Id == id);

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
        TotalItems = order.Items.Sum(oi => oi.Quantity),
        // Add customer information for staff
        CustomerName = $"{order.User.FirstName} {order.User.LastName}",
        CustomerEmail = order.User.Email
      };

      return Ok(new ResponseHelper<OrderResponseDTO>
      {
        Success = true,
        Message = "Order retrieved successfully",
        Data = orderDto
      });
    }

    // Helper to validate status transitions
    private bool IsValidStatusTransition(OrderStatus currentStatus, string newStatusStr)
    {
      if (!Enum.TryParse<OrderStatus>(newStatusStr, out var newStatus))
        return false;

      switch (currentStatus)
      {
        case OrderStatus.Pending:
          return newStatus == OrderStatus.Confirmed || newStatus == OrderStatus.Cancelled;
        case OrderStatus.Confirmed:
          return newStatus == OrderStatus.Ready || newStatus == OrderStatus.Cancelled;
        case OrderStatus.Ready:
          return newStatus == OrderStatus.Completed;
        case OrderStatus.Completed:
        case OrderStatus.Cancelled:
          return false; // Terminal states, can't transition away
        default:
          return false;
      }
    }
  }


  // DTO for updating order status
  public class UpdateOrderStatusDTO
  {
    public string Status { get; set; }
  }
}

public class DashboardStatsDTO
{
  public int PendingOrders { get; set; }
  public int ConfirmedOrders { get; set; }
  public int ReadyOrders { get; set; }
  public int CompletedOrders { get; set; }
  public int CancelledOrders { get; set; }
  public int TotalOrders { get; set; }
  public int TodayOrders { get; set; }
  public decimal TodayRevenue { get; set; }
}
