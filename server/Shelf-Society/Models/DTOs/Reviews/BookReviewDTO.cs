using System;

namespace Shelf_Society.Models.DTOs.Reviews;

public class BookReviewsDTO
{
  public int BookId { get; set; }
  public string Title { get; set; }
  public string Author { get; set; }
  public string ImageUrl { get; set; }
  public double? AverageRating { get; set; }
  public int ReviewCount { get; set; }
  public List<ReviewDTO> Reviews { get; set; }

}
