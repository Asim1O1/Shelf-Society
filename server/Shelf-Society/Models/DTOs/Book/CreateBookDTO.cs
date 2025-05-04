using System;
using Shelf_Society.Models.Entities;

namespace Shelf_Society.Models.DTOs.Book;

public class CreateBookDTO
{
  public string Title { get; set; } = null!;
  public string Author { get; set; } = null!;
  public string ISBN { get; set; } = null!;
  public string Description { get; set; } = null!;
  public decimal Price { get; set; }
  public BookFormat Format { get; set; }
  public string Genre { get; set; }
  public string Language { get; set; }
  public int StockQuantity { get; set; }
  public DateTime PublicationDate { get; set; }
  public string Publisher { get; set; }
  public string ImageUrl { get; set; }

}
