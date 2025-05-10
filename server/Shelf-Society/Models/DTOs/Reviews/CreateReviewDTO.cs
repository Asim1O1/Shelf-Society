using System;

namespace Shelf_Society.Models.DTOs.Reviews;

public class CreateReviewDTO
{
  public int BookId { get; set; }
  public int Rating { get; set; }
  public string Comment { get; set; }

}
