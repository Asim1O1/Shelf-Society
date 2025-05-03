using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Data;
using Shelf_Society.Helpers;
using Shelf_Society.Models.DTOs.Auth;
using Shelf_Society.Models.Entities;

namespace Shelf_Society.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
  private readonly ApplicationDbContext _context;
  private readonly IConfiguration _configuration;

  public AuthController(ApplicationDbContext context, IConfiguration configuration)
  {
    _context = context;
    _configuration = configuration;
  }

  [HttpPost("register")]
  public async Task<IActionResult> Register(RegisterDTO dto)
  {
    if (dto.Password != dto.ConfirmPassword)
    {
      return BadRequest(new ResponseHelper<string>
      {
        Success = false,
        Message = "Passwords do not match.",
        Data = null
      });
    }

    var userExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
    if (userExists)
    {
      return BadRequest(new ResponseHelper<string>
      {
        Success = false,
        Message = "User already exists.",
        Data = null
      });
    }
    var user = new User
    {
      Email = dto.Email,
      FirstName = dto.FirstName,
      LastName = dto.LastName,
      PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
      CreatedAt = DateTime.UtcNow
    };

    await _context.Users.AddAsync(user);
    await _context.SaveChangesAsync();
    return Ok(new ResponseHelper<string>
    {
      Success = true,
      Message = "User registered successfully.",
      Data = null
    });
  }
  [HttpPost("login")]
  public async Task<IActionResult> Login(LoginDTO dto)
  {
    var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
    if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
      return Unauthorized(new ResponseHelper<string>
      {
        Success = false,
        Message = "Invalid credentials.",
        Data = null
      });

    var accessToken = TokenHelper.GenerateAccessToken(
        user,
        _configuration["JwtSettings:Key"],
        _configuration["JwtSettings:Issuer"],
        _configuration["JwtSettings:Audience"],
        int.Parse(_configuration["JwtSettings:ExpirationInMinutes"])
    );

    var refreshToken = TokenHelper.GenerateRefreshToken();
    var expirationMinutes = int.Parse(_configuration["JwtSettings:ExpirationInMinutes"]);

    // FIX: Store the refresh token in the database
    user.RefreshToken = refreshToken;
    user.RefreshTokenExpires = DateTime.UtcNow.AddDays(7);
    await _context.SaveChangesAsync();

    var response = new AuthResponseDTO
    {
      AccessToken = accessToken,
      RefreshToken = refreshToken,
      Email = user.Email,
      FullName = $"{user.FirstName} {user.LastName}",
      Role = user.Role,
      ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes),
      UserId = user.Id
    };

    return Ok(new ResponseHelper<AuthResponseDTO>
    {
      Success = true,
      Message = "Login successful.",
      Data = response
    });
  }

  [HttpPost("refresh")]
  public async Task<IActionResult> Refresh(RefreshTokenDTO dto)
  {
    if (string.IsNullOrEmpty(dto.RefreshToken))
    {
      return BadRequest(new ResponseHelper<string>
      {
        Success = false,
        Message = "Invalid refresh token.",
        Data = null
      });
    }


    var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == dto.RefreshToken);

    if (user == null || user.RefreshTokenExpires < DateTime.UtcNow)
    {
      return Unauthorized(new ResponseHelper<string>
      {
        Success = false,
        Message = "Invalid or expired refresh token.",
        Data = null
      });
    }

    // Generate new tokens
    var newAccessToken = TokenHelper.GenerateAccessToken(user, _configuration["JwtSettings:Key"],
                                                          _configuration["JwtSettings:Issuer"],
                                                          _configuration["JwtSettings:Audience"],
                                                          int.Parse(_configuration["JwtSettings:ExpirationInMinutes"]));
    var newRefreshToken = TokenHelper.GenerateRefreshToken();

    // Save new refresh token and expiration in the database
    user.RefreshToken = newRefreshToken;
    user.RefreshTokenExpires = DateTime.UtcNow.AddDays(7); // Set expiration time for the new refresh token
    await _context.SaveChangesAsync();
    var response = new AuthResponseDTO
    {
      AccessToken = newAccessToken,
      RefreshToken = newRefreshToken,
      Email = user.Email,
      FullName = $"{user.FirstName} {user.LastName}",
      Role = user.Role,
      ExpiresAt = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JwtSettings:ExpirationInMinutes"])),
      UserId = user.Id
    };

    return Ok(new ResponseHelper<AuthResponseDTO>
    {
      Success = true,
      Message = "Token refreshed successfully.",
      Data = response
    });
  }

  [HttpPost("logout")]
  public async Task<IActionResult> Logout(RefreshTokenDTO dto)
  {
    var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == dto.RefreshToken);

    if (user == null)
    {
      return BadRequest(new ResponseHelper<string>
      {
        Success = false,
        Message = "Invalid refresh token.",
        Data = null
      });
    }

    // Clear the refresh token
    user.RefreshToken = null;
    user.RefreshTokenExpires = null;
    await _context.SaveChangesAsync();

    return Ok(new ResponseHelper<string>
    {
      Success = true,
      Message = "Logged out successfully.",
      Data = null
    });
  }




}
