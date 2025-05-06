using System;

namespace Shelf_Society.Models.DTOs.Order;

public class OrderResponseDTO
{
  public int Id { get; set; }
  public string ClaimCode { get; set; }
  public string Status { get; set; }
  public List<OrderItemDTO> Items { get; set; } = new List<OrderItemDTO>();
  public int TotalItems { get; set; }
  public decimal TotalAmount { get; set; }
  public decimal DiscountPercentage { get; set; }
  public decimal DiscountAmount { get; set; }
  public decimal FinalAmount { get; set; }
  public DateTime OrderDate { get; set; }
  public DateTime? CancelledDate { get; set; }
  public DateTime? CompletedDate { get; set; }
  public bool CanCancel { get; set; }

}
