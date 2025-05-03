using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Shelf_Society.Models.Entities;

namespace Shelf_Society.Helpers
{
  public static class TokenHelper
  {
    public static string GenerateAccessToken(User user, string key, string issuer, string audience, int expirationMinutes)
    {
      if (user == null) throw new ArgumentNullException(nameof(user));
      if (string.IsNullOrWhiteSpace(key)) throw new ArgumentException("Key cannot be empty", nameof(key));
      if (string.IsNullOrWhiteSpace(issuer)) throw new ArgumentException("Issuer cannot be empty", nameof(issuer));
      if (string.IsNullOrWhiteSpace(audience)) throw new ArgumentException("Audience cannot be empty", nameof(audience));
      if (expirationMinutes <= 0) throw new ArgumentException("Expiration must be positive", nameof(expirationMinutes));

      try
      {
        var claims = new List<Claim>
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Name, $"{user.FirstName} {user.LastName}"),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unique token identifier
                };

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
          Subject = new ClaimsIdentity(claims),
          Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
          Issuer = issuer,
          Audience = audience,
          SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
      }
      catch (Exception ex)
      {
        // Log the exception here if you have logging configured
        throw new Exception("Failed to generate access token", ex);
      }
    }

    public static string GenerateRefreshToken()
    {
      var randomNumber = new byte[32];
      using (var rng = RandomNumberGenerator.Create())
      {
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
      }
    }
  }
}
