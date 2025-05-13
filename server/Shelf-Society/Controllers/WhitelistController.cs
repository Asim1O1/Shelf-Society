// Controllers/WhitelistController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Data;
using Shelf_Society.Helpers;
using Shelf_Society.Models.DTOs.Whitelist;
using Shelf_Society.Models.Entities;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Shelf_Society.Controllers
{
  [ApiController]
  [Route("api/whitelist")]
  [Authorize] // Only authenticated users can access whitelist
  public class WhitelistController : ControllerBase
  {
    private readonly ApplicationDbContext _context;
    private readonly ILogger<WhitelistController> _logger;

    public WhitelistController(ApplicationDbContext context, ILogger<WhitelistController> logger)
    {
      _context = context;
      _logger = logger;
    }

    /// <summary>
    /// Get the current user's whitelist with pagination and sorting options
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ResponseHelper<PaginationHelper<WhitelistResponseDTO>>>> GetWhitelist(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortBy = "createdAt",
        [FromQuery] string sortOrder = "desc")
    {
      try
      {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
          return Unauthorized(new ResponseHelper<PaginationHelper<WhitelistResponseDTO>>
          {
            Success = false,
            Message = "User not authenticated",
            Data = null
          });
        }

        var query = _context.Whitelists
            .Where(w => w.UserId == userId)
            .Include(w => w.Book)
            .AsQueryable();

        // Apply sorting
        query = ApplySorting(query, sortBy, sortOrder);

        // Apply pagination
        var pagedWhitelist = await PaginationHelper<Whitelist>.CreateAsync(query, pageNumber, pageSize);

        // Map to DTOs
        var whitelistDtos = pagedWhitelist.Items.Select(w => new WhitelistResponseDTO
        {
          Id = w.Id,
          BookId = w.BookId,
          Title = w.Book.Title,
          Author = w.Book.Author,
          Price = w.Book.Price,
          ImageUrl = w.Book.ImageUrl,
          IsAvailable = w.Book.IsAvailable,
          AddedAt = w.CreatedAt,
          StockQuantity = w.Book.StockQuantity,
          Genre = w.Book.Genre
        }).ToList();

        var pagedResponse = new PaginationHelper<WhitelistResponseDTO>(
            whitelistDtos,
            pagedWhitelist.TotalCount,
            pagedWhitelist.PageNumber,
            pagedWhitelist.PageSize);

        return Ok(new ResponseHelper<PaginationHelper<WhitelistResponseDTO>>
        {
          Success = true,
          Message = "Whitelist retrieved successfully",
          Data = pagedResponse
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error retrieving whitelist");
        return StatusCode(500, new ResponseHelper<PaginationHelper<WhitelistResponseDTO>>
        {
          Success = false,
          Message = "An error occurred while retrieving the whitelist",
          Data = null
        });
      }
    }

    /// <summary>
    /// Add a book to the user's whitelist
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ResponseHelper<WhitelistResponseDTO>>> AddToWhitelist([FromBody] AddToWhitelistDTO dto)
    {
      try
      {
        if (!ModelState.IsValid)
        {
          return BadRequest(new ResponseHelper<WhitelistResponseDTO>
          {
            Success = false,
            Message = "Invalid input data",
            Data = null
          });
        }

        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
          return Unauthorized(new ResponseHelper<WhitelistResponseDTO>
          {
            Success = false,
            Message = "User not authenticated",
            Data = null
          });
        }

        // Check if book exists and is available
        var book = await _context.Books.FindAsync(dto.BookId);
        if (book == null)
        {
          return NotFound(new ResponseHelper<WhitelistResponseDTO>
          {
            Success = false,
            Message = "Book not found",
            Data = null
          });
        }

        if (!book.IsAvailable)
        {
          return BadRequest(new ResponseHelper<WhitelistResponseDTO>
          {
            Success = false,
            Message = "Book is not available for whitelisting",
            Data = null
          });
        }

        // Check if book is already in whitelist
        var existingItem = await _context.Whitelists
            .FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == dto.BookId);

        if (existingItem != null)
        {
          return BadRequest(new ResponseHelper<WhitelistResponseDTO>
          {
            Success = false,
            Message = "Book is already in your whitelist",
            Data = null
          });
        }

        // Add to whitelist
        var whitelistItem = new Whitelist
        {
          UserId = userId,
          BookId = dto.BookId,
          CreatedAt = DateTime.UtcNow
        };

        _context.Whitelists.Add(whitelistItem);
        await _context.SaveChangesAsync();

        // Return the added item
        var responseDto = new WhitelistResponseDTO
        {
          Id = whitelistItem.Id,
          BookId = book.Id,
          Title = book.Title,
          Author = book.Author,
          Price = book.Price,
          ImageUrl = book.ImageUrl,
          IsAvailable = book.IsAvailable,
          AddedAt = whitelistItem.CreatedAt,
          StockQuantity = book.StockQuantity,
          Genre = book.Genre
        };

        return Ok(new ResponseHelper<WhitelistResponseDTO>
        {
          Success = true,
          Message = "Book added to whitelist successfully",
          Data = responseDto
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error adding book to whitelist");
        return StatusCode(500, new ResponseHelper<WhitelistResponseDTO>
        {
          Success = false,
          Message = "An error occurred while adding the book to whitelist",
          Data = null
        });
      }
    }

    /// <summary>
    /// Remove a book from the user's whitelist
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseHelper<object>>> RemoveFromWhitelist(int id)
    {
      try
      {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
          return Unauthorized(new ResponseHelper<object>
          {
            Success = false,
            Message = "User not authenticated",
            Data = null
          });
        }

        var whitelistItem = await _context.Whitelists
            .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

        if (whitelistItem == null)
        {
          return NotFound(new ResponseHelper<object>
          {
            Success = false,
            Message = "Whitelist item not found",
            Data = null
          });
        }

        _context.Whitelists.Remove(whitelistItem);
        await _context.SaveChangesAsync();

        return Ok(new ResponseHelper<object>
        {
          Success = true,
          Message = "Book removed from whitelist successfully",
          Data = null
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error removing book from whitelist");
        return StatusCode(500, new ResponseHelper<object>
        {
          Success = false,
          Message = "An error occurred while removing the book from whitelist",
          Data = null
        });
      }
    }

    /// <summary>
    /// Check if a book is in the user's whitelist
    /// </summary>
    [HttpGet("check/{bookId}")]
    public async Task<ActionResult<ResponseHelper<bool>>> CheckBookInWhitelist(int bookId)
    {
      try
      {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
          return Unauthorized(new ResponseHelper<bool>
          {
            Success = false,
            Message = "User not authenticated",
            Data = false
          });
        }

        var exists = await _context.Whitelists
            .AnyAsync(w => w.UserId == userId && w.BookId == bookId);

        return Ok(new ResponseHelper<bool>
        {
          Success = true,
          Message = exists ? "Book is in whitelist" : "Book is not in whitelist",
          Data = exists
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error checking book in whitelist");
        return StatusCode(500, new ResponseHelper<bool>
        {
          Success = false,
          Message = "An error occurred while checking the book in whitelist",
          Data = false
        });
      }
    }

    /// <summary>
    /// Clear all items from the user's whitelist
    /// </summary>
    [HttpDelete("clear")]
    public async Task<ActionResult<ResponseHelper<object>>> ClearWhitelist()
    {
      try
      {
        var userId = GetUserId();
        if (userId == Guid.Empty)
        {
          return Unauthorized(new ResponseHelper<object>
          {
            Success = false,
            Message = "User not authenticated",
            Data = null
          });
        }

        var whitelistItems = await _context.Whitelists
            .Where(w => w.UserId == userId)
            .ToListAsync();

        _context.Whitelists.RemoveRange(whitelistItems);
        await _context.SaveChangesAsync();

        return Ok(new ResponseHelper<object>
        {
          Success = true,
          Message = "Whitelist cleared successfully",
          Data = null
        });
      }
      catch (Exception ex)
      {
        _logger.LogError(ex, "Error clearing whitelist");
        return StatusCode(500, new ResponseHelper<object>
        {
          Success = false,
          Message = "An error occurred while clearing the whitelist",
          Data = null
        });
      }
    }

    private Guid GetUserId()
    {
      var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
      return userIdClaim != null ? Guid.Parse(userIdClaim) : Guid.Empty;
    }

    private IQueryable<Whitelist> ApplySorting(IQueryable<Whitelist> query, string sortBy, string sortOrder)
    {
      sortBy = sortBy.ToLower();
      sortOrder = sortOrder.ToLower();

      query = sortBy switch
      {
        "title" => sortOrder == "asc" 
          ? query.OrderBy(w => w.Book.Title)
          : query.OrderByDescending(w => w.Book.Title),
        "author" => sortOrder == "asc"
          ? query.OrderBy(w => w.Book.Author)
          : query.OrderByDescending(w => w.Book.Author),
        "price" => sortOrder == "asc"
          ? query.OrderBy(w => w.Book.Price)
          : query.OrderByDescending(w => w.Book.Price),
        _ => sortOrder == "asc"
          ? query.OrderBy(w => w.CreatedAt)
          : query.OrderByDescending(w => w.CreatedAt)
      };

      return query;
    }
  }
}
