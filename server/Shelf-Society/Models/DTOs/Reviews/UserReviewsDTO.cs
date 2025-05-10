using System;

namespace Shelf_Society.Models.DTOs.Reviews;

public class UserReviewsDTO
{
  public Guid UserId { get; set; }
  public string UserName { get; set; }
  public int ReviewCount { get; set; }
  public List<ReviewDTO> Reviews { get; set; }

}
