// Controllers/StaffManagementController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Data;
using Shelf_Society.Helpers;
using Shelf_Society.Models.DTOs.Staff;
using Shelf_Society.Models.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Logging;

namespace Shelf_Society.Controllers
{
  [ApiController]
  [Route("api/staff-management")]
  [Authorize(Roles = "Admin")] // Only admins can manage staff
  public class StaffManagementController : ControllerBase
  {
    private readonly ApplicationDbContext _context;
    private readonly ILogger<StaffManagementController> _logger;

    public StaffManagementController(ApplicationDbContext context, ILogger<StaffManagementController> logger)
    {
      _context = context;
      _logger = logger;
    }

    /// <summary>
    /// Get all staff members with pagination and search functionality
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ResponseHelper<PaginationHelper<StaffResponseDTO>>>> GetStaffMembers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string searchTerm = "",
        [FromQuery] string sortBy = "lastName",
        [FromQuery] string sortOrder = "asc")
    {
      try
      {
        var query = _context.Users
            .Where(u => u.Role == "Staff")
            .AsQueryable();

        // Apply search if searchTerm is provided
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
          searchTerm = searchTerm.ToLower();
          query = query.Where(u =>
              u.FirstName.ToLower().Contains(searchTerm) ||
              u.LastName.ToLower().Contains(searchTerm) ||
              u.Email.ToLower().Contains(searchTerm));
        }

        // Apply sorting
        query = sortBy.ToLower() switch
        {
          "firstname" => sortOrder.ToLower() == "asc"
              ? query.OrderBy(u => u.FirstName)
              : query.OrderByDescending(u => u.FirstName),
          "email" => sortOrder.ToLower() == "asc"
              ? query.OrderBy(u => u.Email)
              : query.OrderByDescending(u => u.Email),
          "createdat" => sortOrder.ToLower() == "asc"
              ? query.OrderBy(u => u.CreatedAt)
              : query.OrderByDescending(u => u.CreatedAt),
          _ => sortOrder.ToLower() == "asc"
              ? query.OrderBy(u => u.LastName).ThenBy(u => u.FirstName)
              : query.OrderByDescending(u => u.LastName).ThenByDescending(u => u.FirstName)
        };

        // Apply pagination
        var pagedStaff = await PaginationHelper<User>.CreateAsync(query, pageNumber, pageSize);

        // Map to DTOs
        var staffDtos = pagedStaff.Items.Select(u => new StaffResponseDTO
        {
          Id = u.Id,
          Email = u.Email,
          FirstName = u.FirstName,
          LastName = u.LastName,
          CreatedAt = u.CreatedAt,
          LastLoginAt = u.LastLoginAt,
          IsActive = u.IsActive
        }).ToList();

        var pagedResponse = new PaginationHelper<StaffResponseDTO>(
            staffDtos,
            pagedStaff.TotalCount,
            pagedStaff.PageNumber,
            pagedStaff.PageSize);

        return Ok(new ResponseHelper<PaginationHelper<StaffResponseDTO>>
        {
          Success = true,
          Message = "Staff members retrieved successfully",
          Data = pagedResponse
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error retrieving staff members");
        return StatusCode(500, new ResponseHelper<PaginationHelper<StaffResponseDTO>>
        {
          Success = false,
          Message = "An error occurred while retrieving staff members",
          Data = null
        });
      }
    }

    /// <summary>
    /// Get staff member by id
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseHelper<StaffResponseDTO>>> GetStaffMember(Guid id)
    {
      try
      {
        var staff = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == "Staff");

        if (staff == null)
        {
          return NotFound(new ResponseHelper<StaffResponseDTO>
          {
            Success = false,
            Message = "Staff member not found",
            Data = null
          });
        }

        var staffDto = new StaffResponseDTO
        {
          Id = staff.Id,
          Email = staff.Email,
          FirstName = staff.FirstName,
          LastName = staff.LastName,
          CreatedAt = staff.CreatedAt,
          LastLoginAt = staff.LastLoginAt,
          IsActive = staff.IsActive
        };

        return Ok(new ResponseHelper<StaffResponseDTO>
        {
          Success = true,
          Message = "Staff member retrieved successfully",
          Data = staffDto
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error retrieving staff member {StaffId}", id);
        return StatusCode(500, new ResponseHelper<StaffResponseDTO>
        {
          Success = false,
          Message = "An error occurred while retrieving the staff member",
          Data = null
        });
      }
    }

    /// <summary>
    /// Create a new staff member
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ResponseHelper<StaffResponseDTO>>> CreateStaffMember([FromBody] CreateStaffDTO dto)
    {
      try
      {
        if (!ModelState.IsValid)
        {
          return BadRequest(new ResponseHelper<StaffResponseDTO>
          {
            Success = false,
            Message = "Invalid input data",
            Data = null
          });
        }

        if (dto.Password != dto.ConfirmPassword)
        {
          return BadRequest(new ResponseHelper<StaffResponseDTO>
          {
            Success = false,
            Message = "Passwords do not match",
            Data = null
          });
        }

        // Validate password strength
        if (!IsPasswordStrong(dto.Password))
        {
          return BadRequest(new ResponseHelper<StaffResponseDTO>
          {
            Success = false,
            Message = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            Data = null
          });
        }

        var userExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (userExists)
        {
          return BadRequest(new ResponseHelper<StaffResponseDTO>
          {
            Success = false,
            Message = "Email already in use",
            Data = null
          });
        }

        var staff = new User
        {
          Email = dto.Email,
          FirstName = dto.FirstName,
          LastName = dto.LastName,
          PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
          Role = "Staff",
          CreatedAt = DateTime.UtcNow,
          IsActive = true
        };

        _context.Users.Add(staff);
        await _context.SaveChangesAsync();

        _logger.LogInformation("New staff member created: {Email}", staff.Email);

        var staffDto = new StaffResponseDTO
        {
          Id = staff.Id,
          Email = staff.Email,
          FirstName = staff.FirstName,
          LastName = staff.LastName,
          CreatedAt = staff.CreatedAt,
          LastLoginAt = staff.LastLoginAt,
          IsActive = staff.IsActive
        };

        return CreatedAtAction(nameof(GetStaffMember), new { id = staff.Id }, new ResponseHelper<StaffResponseDTO>
        {
          Success = true,
          Message = "Staff member created successfully",
          Data = staffDto
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error creating staff member");
        return StatusCode(500, new ResponseHelper<StaffResponseDTO>
        {
          Success = false,
          Message = "An error occurred while creating the staff member",
          Data = null
        });
      }
    }

    /// <summary>
    /// Update staff member
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseHelper<StaffResponseDTO>>> UpdateStaffMember(Guid id, [FromBody] UpdateStaffDTO dto)
    {
      try
      {
        if (!ModelState.IsValid)
        {
          return BadRequest(new ResponseHelper<StaffResponseDTO>
          {
            Success = false,
            Message = "Invalid input data",
            Data = null
          });
        }

        var staff = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == "Staff");

        if (staff == null)
        {
          return NotFound(new ResponseHelper<StaffResponseDTO>
          {
            Success = false,
            Message = "Staff member not found",
            Data = null
          });
        }

        // Check if email is being changed and is already in use
        if (dto.Email != null && dto.Email != staff.Email)
        {
          var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
          if (emailExists)
          {
            return BadRequest(new ResponseHelper<StaffResponseDTO>
            {
              Success = false,
              Message = "Email already in use",
              Data = null
            });
          }

          staff.Email = dto.Email;
        }

        // Update other fields if provided
        if (dto.FirstName != null)
          staff.FirstName = dto.FirstName;

        if (dto.LastName != null)
          staff.LastName = dto.LastName;

        if (dto.IsActive.HasValue)
          staff.IsActive = dto.IsActive.Value;

        // Update password if provided
        if (!string.IsNullOrEmpty(dto.Password))
        {
          if (dto.Password != dto.ConfirmPassword)
          {
            return BadRequest(new ResponseHelper<StaffResponseDTO>
            {
              Success = false,
              Message = "Passwords do not match",
              Data = null
            });
          }

          if (!IsPasswordStrong(dto.Password))
          {
            return BadRequest(new ResponseHelper<StaffResponseDTO>
            {
              Success = false,
              Message = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
              Data = null
            });
          }

          staff.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Staff member updated: {Email}", staff.Email);

        var staffDto = new StaffResponseDTO
        {
          Id = staff.Id,
          Email = staff.Email,
          FirstName = staff.FirstName,
          LastName = staff.LastName,
          CreatedAt = staff.CreatedAt,
          LastLoginAt = staff.LastLoginAt,
          IsActive = staff.IsActive
        };

        return Ok(new ResponseHelper<StaffResponseDTO>
        {
          Success = true,
          Message = "Staff member updated successfully",
          Data = staffDto
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error updating staff member {StaffId}", id);
        return StatusCode(500, new ResponseHelper<StaffResponseDTO>
        {
          Success = false,
          Message = "An error occurred while updating the staff member",
          Data = null
        });
      }
    }

    /// <summary>
    /// Delete staff member
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseHelper<object>>> DeleteStaffMember(Guid id)
    {
      try
      {
        var staff = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == "Staff");

        if (staff == null)
        {
          return NotFound(new ResponseHelper<object>
          {
            Success = false,
            Message = "Staff member not found",
            Data = null
          });
        }

        // Soft delete by deactivating the account
        staff.IsActive = false;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Staff member deactivated: {Email}", staff.Email);

        return Ok(new ResponseHelper<object>
        {
          Success = true,
          Message = "Staff member deactivated successfully",
          Data = null
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error deactivating staff member {StaffId}", id);
        return StatusCode(500, new ResponseHelper<object>
        {
          Success = false,
          Message = "An error occurred while deactivating the staff member",
          Data = null
        });
      }
    }

    /// <summary>
    /// Reactivate a deactivated staff member
    /// </summary>
    [HttpPost("{id}/reactivate")]
    public async Task<ActionResult<ResponseHelper<StaffResponseDTO>>> ReactivateStaffMember(Guid id)
    {
      try
      {
        var staff = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id && u.Role == "Staff");

        if (staff == null)
        {
          return NotFound(new ResponseHelper<StaffResponseDTO>
          {
            Success = false,
            Message = "Staff member not found",
            Data = null
          });
        }

        if (staff.IsActive)
        {
          return BadRequest(new ResponseHelper<StaffResponseDTO>
          {
            Success = false,
            Message = "Staff member is already active",
            Data = null
          });
        }

        staff.IsActive = true;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Staff member reactivated: {Email}", staff.Email);

        var staffDto = new StaffResponseDTO
        {
          Id = staff.Id,
          Email = staff.Email,
          FirstName = staff.FirstName,
          LastName = staff.LastName,
          CreatedAt = staff.CreatedAt,
          LastLoginAt = staff.LastLoginAt,
          IsActive = staff.IsActive
        };

        return Ok(new ResponseHelper<StaffResponseDTO>
        {
          Success = true,
          Message = "Staff member reactivated successfully",
          Data = staffDto
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error reactivating staff member {StaffId}", id);
        return StatusCode(500, new ResponseHelper<StaffResponseDTO>
        {
          Success = false,
          Message = "An error occurred while reactivating the staff member",
          Data = null
        });
      }
    }

    private bool IsPasswordStrong(string password)
    {
      if (string.IsNullOrEmpty(password) || password.Length < 8)
        return false;

      bool hasUpper = password.Any(char.IsUpper);
      bool hasLower = password.Any(char.IsLower);
      bool hasDigit = password.Any(char.IsDigit);
      bool hasSpecial = password.Any(c => !char.IsLetterOrDigit(c));

      return hasUpper && hasLower && hasDigit && hasSpecial;
    }
  }
}
