using System;

namespace Shelf_Society.Models.Entities;

public class BookImage
{
  public int Id { get; set; }
  public int BookId { get; set; }  // Foreign key to Book
  public string ImageUrl { get; set; } = null!;
  public string Caption { get; set; } = string.Empty;  // Optional description
  public int DisplayOrder { get; set; }  // For controlling image order

  // Navigation property
  public Book Book { get; set; } = null!;

}
