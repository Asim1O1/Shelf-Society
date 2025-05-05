using System;

namespace Shelf_Society.Models.DTOs.Cart;

public class AddToCartDTO
{
  public int BookId { get; set; }
  public int Quantity { get; set; } = 1;

}
