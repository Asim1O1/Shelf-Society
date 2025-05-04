using System;

namespace Shelf_Society.Models.DTOs.Book;

public class UpdateBookDTO
{
  public string Title { get; set; }
  public string Author { get; set; }
  public string Description { get; set; }
  public decimal? Price { get; set; }
  public string Genre { get; set; }
  public string Language { get; set; }
  public int? StockQuantity { get; set; }
  public string Publisher { get; set; }
  public string ImageUrl { get; set; }

}
