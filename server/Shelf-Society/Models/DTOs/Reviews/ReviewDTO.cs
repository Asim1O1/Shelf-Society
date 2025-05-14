using System;

namespace Shelf_Society.Models.DTOs.Reviews;

public class ReviewDTO
{
  public int Id { get; set; }
  public int BookId { get; set; }
  public string BookTitle { get; set; }
  public string BookImageUrl { get; set; }
  public Guid UserId { get; set; }
  public string UserName { get; set; }
  public string Email { get; set; }
  public int Rating { get; set; }
  public string Comment { get; set; }
  public DateTime CreatedAt { get; set; }

}
