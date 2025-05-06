// Controllers/AnnouncementController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Data;
using Shelf_Society.Helpers;
using Shelf_Society.Models.DTOs.Announcement;
using Shelf_Society.Models.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shelf_Society.Controllers
{
  [ApiController]
  [Route("api/announcements")]
  public class AnnouncementController : ControllerBase
  {
    private readonly ApplicationDbContext _context;

    public AnnouncementController(ApplicationDbContext context)
    {
      _context = context;
    }

    // Get active announcements (public endpoint)
    [HttpGet("active")]
    public async Task<ActionResult<ResponseHelper<AnnouncementResponseDTO[]>>> GetActiveAnnouncements()
    {
      var now = DateTime.UtcNow;
      var announcements = await _context.Announcements
          .Where(a => a.IsActive && a.StartDate <= now && a.EndDate >= now)
          .OrderByDescending(a => a.CreatedAt)
          .Select(a => new AnnouncementResponseDTO
          {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt
          })
          .ToArrayAsync();

      return Ok(new ResponseHelper<AnnouncementResponseDTO[]>
      {
        Success = true,
        Message = "Active announcements retrieved successfully",
        Data = announcements
      });
    }

    // Get all announcements (admin only)
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<ResponseHelper<PaginationHelper<AnnouncementResponseDTO>>>> GetAnnouncements(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
      var query = _context.Announcements
          .OrderByDescending(a => a.CreatedAt)
          .AsQueryable();

      // Apply pagination
      var pagedAnnouncements = await PaginationHelper<Announcement>.CreateAsync(query, pageNumber, pageSize);

      // Map to DTOs
      var announcementDtos = pagedAnnouncements.Items.Select(a => new AnnouncementResponseDTO
      {
        Id = a.Id,
        Title = a.Title,
        Content = a.Content,
        StartDate = a.StartDate,
        EndDate = a.EndDate,
        IsActive = a.IsActive,
        CreatedAt = a.CreatedAt
      }).ToList();

      // Create final response with pagination
      var pagedResponse = new PaginationHelper<AnnouncementResponseDTO>(
          announcementDtos,
          pagedAnnouncements.TotalCount,
          pagedAnnouncements.PageNumber,
          pagedAnnouncements.PageSize);

      return Ok(new ResponseHelper<PaginationHelper<AnnouncementResponseDTO>>
      {
        Success = true,
        Message = "Announcements retrieved successfully",
        Data = pagedResponse
      });
    }

    // Get announcement by id (admin only)
    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseHelper<AnnouncementResponseDTO>>> GetAnnouncementById(int id)
    {
      var announcement = await _context.Announcements.FindAsync(id);

      if (announcement == null)
      {
        return NotFound(new ResponseHelper<AnnouncementResponseDTO>
        {
          Success = false,
          Message = "Announcement not found",
          Data = null
        });
      }

      var announcementDto = new AnnouncementResponseDTO
      {
        Id = announcement.Id,
        Title = announcement.Title,
        Content = announcement.Content,
        StartDate = announcement.StartDate,
        EndDate = announcement.EndDate,
        IsActive = announcement.IsActive,
        CreatedAt = announcement.CreatedAt
      };

      return Ok(new ResponseHelper<AnnouncementResponseDTO>
      {
        Success = true,
        Message = "Announcement retrieved successfully",
        Data = announcementDto
      });
    }

    // Create new announcement (admin only)
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ResponseHelper<AnnouncementResponseDTO>>> CreateAnnouncement(CreateAnnouncementDTO dto)
    {
      // Validate input
      if (string.IsNullOrWhiteSpace(dto.Title))
      {
        return BadRequest(new ResponseHelper<AnnouncementResponseDTO>
        {
          Success = false,
          Message = "Title is required",
          Data = null
        });
      }

      if (string.IsNullOrWhiteSpace(dto.Content))
      {
        return BadRequest(new ResponseHelper<AnnouncementResponseDTO>
        {
          Success = false,
          Message = "Content is required",
          Data = null
        });
      }

      if (dto.StartDate >= dto.EndDate)
      {
        return BadRequest(new ResponseHelper<AnnouncementResponseDTO>
        {
          Success = false,
          Message = "End date must be after start date",
          Data = null
        });
      }

      // Create new announcement
      var announcement = new Announcement
      {
        Title = dto.Title,
        Content = dto.Content,
        StartDate = dto.StartDate.ToUniversalTime(),
        EndDate = dto.EndDate.ToUniversalTime(),
        IsActive = true,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
      };

      _context.Announcements.Add(announcement);
      await _context.SaveChangesAsync();

      var announcementDto = new AnnouncementResponseDTO
      {
        Id = announcement.Id,
        Title = announcement.Title,
        Content = announcement.Content,
        StartDate = announcement.StartDate,
        EndDate = announcement.EndDate,
        IsActive = announcement.IsActive,
        CreatedAt = announcement.CreatedAt
      };

      return CreatedAtAction(nameof(GetAnnouncementById), new { id = announcement.Id }, new ResponseHelper<AnnouncementResponseDTO>
      {
        Success = true,
        Message = "Announcement created successfully",
        Data = announcementDto
      });
    }

    // Update announcement (admin only)
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseHelper<AnnouncementResponseDTO>>> UpdateAnnouncement(int id, UpdateAnnouncementDTO dto)
    {
      var announcement = await _context.Announcements.FindAsync(id);

      if (announcement == null)
      {
        return NotFound(new ResponseHelper<AnnouncementResponseDTO>
        {
          Success = false,
          Message = "Announcement not found",
          Data = null
        });
      }

      // Validate dates if both are provided
      if (dto.StartDate.HasValue && dto.EndDate.HasValue && dto.StartDate >= dto.EndDate)
      {
        return BadRequest(new ResponseHelper<AnnouncementResponseDTO>
        {
          Success = false,
          Message = "End date must be after start date",
          Data = null
        });
      }

      // Update fields if provided
      if (!string.IsNullOrWhiteSpace(dto.Title))
        announcement.Title = dto.Title;

      if (!string.IsNullOrWhiteSpace(dto.Content))
        announcement.Content = dto.Content;

      if (dto.StartDate.HasValue)
        announcement.StartDate = dto.StartDate.Value.ToUniversalTime();

      if (dto.EndDate.HasValue)
        announcement.EndDate = dto.EndDate.Value.ToUniversalTime();

      if (dto.IsActive.HasValue)
        announcement.IsActive = dto.IsActive.Value;

      announcement.UpdatedAt = DateTime.UtcNow;

      await _context.SaveChangesAsync();

      var announcementDto = new AnnouncementResponseDTO
      {
        Id = announcement.Id,
        Title = announcement.Title,
        Content = announcement.Content,
        StartDate = announcement.StartDate,
        EndDate = announcement.EndDate,
        IsActive = announcement.IsActive,
        CreatedAt = announcement.CreatedAt
      };

      return Ok(new ResponseHelper<AnnouncementResponseDTO>
      {
        Success = true,
        Message = "Announcement updated successfully",
        Data = announcementDto
      });
    }

    // Delete announcement (admin only)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseHelper<object>>> DeleteAnnouncement(int id)
    {
      var announcement = await _context.Announcements.FindAsync(id);

      if (announcement == null)
      {
        return NotFound(new ResponseHelper<object>
        {
          Success = false,
          Message = "Announcement not found",
          Data = null
        });
      }

      _context.Announcements.Remove(announcement);
      await _context.SaveChangesAsync();

      return Ok(new ResponseHelper<object>
      {
        Success = true,
        Message = "Announcement deleted successfully",
        Data = null
      });
    }
  }
}
