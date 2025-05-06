// Models/Entities/Order.cs
using System;
using System.Collections.Generic;

namespace Shelf_Society.Models.Entities
{
  public enum OrderStatus
  {
    Pending,
    Confirmed,
    Ready,
    Completed,
    Cancelled
  }

  public class Order
  {
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string ClaimCode { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime? CancelledDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual User User { get; set; }
    public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
  }
}
