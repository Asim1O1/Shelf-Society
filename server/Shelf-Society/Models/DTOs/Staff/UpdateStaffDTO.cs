using System;

namespace Shelf_Society.Models.DTOs.Staff;

public class UpdateStaffDTO
{
  public string? Email { get; set; }
  public string? FirstName { get; set; }
  public string? LastName { get; set; }
  public string? Password { get; set; }
  public string? ConfirmPassword { get; set; }

}
