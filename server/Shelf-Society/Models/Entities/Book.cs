using System;

namespace Shelf_Society.Models.Entities;

public class Book
{
  public int Id { get; set; }
  public string Title { get; set; } = null!;
  public string Author { get; set; }= null!;
  public string ISBN { get; set; } = null!;
  public string Description { get; set; } = null!;
  public decimal Price { get; set; } = 0.0m;
  public BookFormat Format { get; set; }
  public string Genre { get; set; }
  public string Language { get; set; }
  public int StockQuantity { get; set; }
  public double Rating { get; set; }
  public DateTime PublicationDate { get; set; }
  public string Publisher { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime? UpdatedAt { get; set; }
  public bool IsAvailable { get; set; }
  public string ImageUrl { get; set; }

}

public enum BookFormat
{
  Paperback,
  Hardcover,
  Signed,
  Limited,
  FirstEdition,
  CollectorsEdition,
  AuthorsEdition,
  DeluxeEdition,
  EBook
}
