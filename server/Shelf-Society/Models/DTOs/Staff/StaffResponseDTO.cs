using System;

namespace Shelf_Society.Models.DTOs.Staff;

public class StaffResponseDTO
{
  public Guid Id { get; set; }
  public string Email { get; set; }
  public string FirstName { get; set; }
  public string LastName { get; set; }
  public DateTime CreatedAt { get; set; }

}
