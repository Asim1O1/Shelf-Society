using System;

namespace Shelf_Society.Models.DTOs.Announcement;

public class AnnouncementResponseDTO
{
  public int Id { get; set; }
  public string Title { get; set; }
  public string Content { get; set; }
  public DateTime StartDate { get; set; }
  public DateTime EndDate { get; set; }
  public bool IsActive { get; set; }
  public DateTime CreatedAt { get; set; }

}
