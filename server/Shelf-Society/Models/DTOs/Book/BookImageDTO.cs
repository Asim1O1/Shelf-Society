using System;

namespace Shelf_Society.Models.DTOs.Book;

public class BookImageDTO
{
  public int Id { get; set; }
  public string ImageUrl { get; set; } = null!;
  public string Caption { get; set; } = string.Empty;
  public int DisplayOrder { get; set; }

}
