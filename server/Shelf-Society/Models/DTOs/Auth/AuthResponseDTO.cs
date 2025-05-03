using System;

namespace Shelf_Society.Models.DTOs.Auth
{
  public class AuthResponseDTO
  {
    public string AccessToken { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Role { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public Guid UserId { get; set; } // Optional, but helpful
  }
}
