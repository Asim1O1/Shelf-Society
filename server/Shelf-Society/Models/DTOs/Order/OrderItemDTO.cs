using System;

namespace Shelf_Society.Models.DTOs.Order;

public class OrderItemDTO
{
  public int Id { get; set; }
  public int BookId { get; set; }
  public string Title { get; set; }
  public string Author { get; set; }
  public string ImageUrl { get; set; }
  public int Quantity { get; set; }
  public decimal Price { get; set; }
  public decimal Subtotal { get; set; }

}
