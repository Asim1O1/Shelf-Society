// Controllers/StaffController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Data;
using Shelf_Society.Helpers;
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

    public StaffController(ApplicationDbContext context)
    {
      _context = context;
    }

    // Process a claim code
    [HttpGet("orders/claim/{claimCode}")]
    public async Task<ActionResult<ResponseHelper<OrderResponseDTO>>> GetOrderByClaimCode(string claimCode)
    {
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
      var order = await _context.Orders
          .Include(o => o.Items)
          .ThenInclude(oi => oi.Book)
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

      // Validate status transition
      if (!IsValidStatusTransition(order.Status, dto.Status))
      {
        return BadRequest(new ResponseHelper<OrderResponseDTO>
        {
          Success = false,
          Message = "Invalid status transition",
          Data = null
        });
      }

      // Update order status
      var newStatus = Enum.Parse<OrderStatus>(dto.Status);
      order.Status = newStatus;
      order.UpdatedAt = DateTime.UtcNow;

      // Set completion date if order is now completed
      if (newStatus == OrderStatus.Completed)
      {
        order.CompletedDate = DateTime.UtcNow;
      }

      await _context.SaveChangesAsync();

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

      return Ok(new ResponseHelper<OrderResponseDTO>
      {
        Success = true,
        Message = "Order status updated successfully",
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
