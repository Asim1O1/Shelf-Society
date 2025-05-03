using System;

namespace Shelf_Society.Models.DTOs.Auth;

public class RegisterDTO
{
  public string Email { get; set; } = null!;

  public string FirstName { get; set; } = null!;
  public string LastName { get; set; } = null!;


  public string Password { get; set; } = null!;
  public string? ConfirmPassword { get; set; } = null!;


}
