using System;

namespace Shelf_Society.Models.DTOs.Auth;

public class LoginDTO
{
  public string Email { get; set; } = null!;
  public string Password { get; set; } = null!;

}
