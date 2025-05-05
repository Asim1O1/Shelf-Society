using System;

namespace Shelf_Society.Models.DTOs.Cart;

public class CartItemDTO
{
  public int Id { get; set; }
  public int BookId { get; set; }
  public string Title { get; set; }
  public string Author { get; set; }
  public string ImageUrl { get; set; }
  public decimal Price { get; set; }
  public int Quantity { get; set; }
  public decimal Subtotal { get; set; }
  public bool IsAvailable { get; set; }

}
