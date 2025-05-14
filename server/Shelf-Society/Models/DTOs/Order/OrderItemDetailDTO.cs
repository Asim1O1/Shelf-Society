using System;

namespace Shelf_Society.Models.DTOs.Order;

public class OrderItemDetailDTO
{
  public string Title { get; set; }
  public int Quantity { get; set; }
  public decimal Price { get; set; }
  public decimal Subtotal { get; set; }

}
