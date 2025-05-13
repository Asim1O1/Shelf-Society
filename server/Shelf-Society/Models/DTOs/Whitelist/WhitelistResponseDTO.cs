using System;

namespace Shelf_Society.Models.DTOs.Whitelist;

public class WhitelistResponseDTO
{
  public int Id { get; set; }
  public int BookId { get; set; }
  public string Title { get; set; }
  public string Author { get; set; }
  public decimal Price { get; set; }
  public string ImageUrl { get; set; }
  public bool IsAvailable { get; set; }
  public DateTime AddedAt { get; set; }
  public int StockQuantity { get; set; }
  public string Genre { get; set; }
}
