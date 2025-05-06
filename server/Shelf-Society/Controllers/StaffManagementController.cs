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

namespace Shelf_Society.Controllers
{
  [ApiController]
  [Route("api/staff-management")]
  [Authorize(Roles = "Admin")] // Only admins can manage staff
  public class StaffManagementController : ControllerBase
  {
    private readonly ApplicationDbContext _context;

    public StaffManagementController(ApplicationDbContext context)
    {
      _context = context;
    }

    // Get all staff members
    [HttpGet]
    public async Task<ActionResult<ResponseHelper<PaginationHelper<StaffResponseDTO>>>> GetStaffMembers(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
      var query = _context.Users
          .Where(u => u.Role == "Staff")
          .OrderBy(u => u.LastName)
          .ThenBy(u => u.FirstName)
          .AsQueryable();

      // Apply pagination
      var pagedStaff = await PaginationHelper<User>.CreateAsync(query, pageNumber, pageSize);

      // Map to DTOs
      var staffDtos = pagedStaff.Items.Select(u => new StaffResponseDTO
      {
        Id = u.Id,
        Email = u.Email,
        FirstName = u.FirstName,
        LastName = u.LastName,
        CreatedAt = u.CreatedAt
      }).ToList();

      // Create final response with pagination
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

    // Get staff member by id
    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseHelper<StaffResponseDTO>>> GetStaffMember(Guid id)
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
        CreatedAt = staff.CreatedAt
      };

      return Ok(new ResponseHelper<StaffResponseDTO>
      {
        Success = true,
        Message = "Staff member retrieved successfully",
        Data = staffDto
      });
    }

    // Create a new staff member
    [HttpPost]
    public async Task<ActionResult<ResponseHelper<StaffResponseDTO>>> CreateStaffMember(CreateStaffDTO dto)
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
        CreatedAt = DateTime.UtcNow
      };

      _context.Users.Add(staff);
      await _context.SaveChangesAsync();

      var staffDto = new StaffResponseDTO
      {
        Id = staff.Id,
        Email = staff.Email,
        FirstName = staff.FirstName,
        LastName = staff.LastName,
        CreatedAt = staff.CreatedAt
      };

      return CreatedAtAction(nameof(GetStaffMember), new { id = staff.Id }, new ResponseHelper<StaffResponseDTO>
      {
        Success = true,
        Message = "Staff member created successfully",
        Data = staffDto
      });
    }

    // Update staff member
    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseHelper<StaffResponseDTO>>> UpdateStaffMember(Guid id, UpdateStaffDTO dto)
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

        staff.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
      }

      await _context.SaveChangesAsync();

      var staffDto = new StaffResponseDTO
      {
        Id = staff.Id,
        Email = staff.Email,
        FirstName = staff.FirstName,
        LastName = staff.LastName,
        CreatedAt = staff.CreatedAt
      };

      return Ok(new ResponseHelper<StaffResponseDTO>
      {
        Success = true,
        Message = "Staff member updated successfully",
        Data = staffDto
      });
    }

    // Delete staff member
    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseHelper<object>>> DeleteStaffMember(Guid id)
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

      _context.Users.Remove(staff);
      await _context.SaveChangesAsync();

      return Ok(new ResponseHelper<object>
      {
        Success = true,
        Message = "Staff member deleted successfully",
        Data = null
      });
    }
  }
}
