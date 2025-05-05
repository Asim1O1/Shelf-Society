using System;

namespace Shelf_Society.Models.DTOs.Cart;

public class CartResponseDTO
{
  public int Id { get; set; }
  public List<CartItemDTO> Items { get; set; } = new List<CartItemDTO>();
  public int TotalItems { get; set; }
  public decimal TotalPrice { get; set; }
  public decimal DiscountPercentage { get; set; }
  public decimal DiscountAmount { get; set; }
  public decimal FinalPrice { get; set; }
  public DateTime UpdatedAt { get; set; }

}
