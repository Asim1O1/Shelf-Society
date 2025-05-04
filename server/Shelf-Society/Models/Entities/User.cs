using System;
using System.ComponentModel.DataAnnotations;

namespace Shelf_Society.Models.Entities
{
  public class User
  {
    [Key]
    public Guid Id { get; set; }

    [Required]
    [EmailAddress]
    [StringLength(100, ErrorMessage = "Email length can't be more than 100 characters.")]
    public string Email { get; set; } = null!;

    [Required]
    public string PasswordHash { get; set; } = null!;

    [Required]
    [StringLength(50, ErrorMessage = "First name length can't be more than 50 characters.")]
    [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "First name can only contain letters.")]
    public string FirstName { get; set; } = null!;

    [Required]
    [StringLength(50, ErrorMessage = "Last name length can't be more than 50 characters.")]
    [RegularExpression(@"^[a-zA-Z]+$", ErrorMessage = "Last name can only contain letters.")]
    public string LastName { get; set; } = null!;

    public string Role { get; set; } = "Member"; // Member, Staff, Admin,
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Add Refresh Token and its expiration properties
    public string? RefreshToken { get; set; }  // Store the refresh token
    public DateTime? RefreshTokenExpires { get; set; }  // Store the expiry time for the refresh token
  }
}
