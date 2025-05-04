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

namespace Shelf_Society.Controllers
{
  [ApiController]
  [Route("api/whitelist")]
  [Authorize] // Only authenticated users can access whitelist
  public class WhitelistController : ControllerBase
  {
    private readonly ApplicationDbContext _context;

    public WhitelistController(ApplicationDbContext context)
    {
      _context = context;
    }

    // Get the current user's whitelist
    [HttpGet]
    public async Task<ActionResult<ResponseHelper<PaginationHelper<WhitelistResponseDTO>>>> GetWhitelist(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      var query = _context.Whitelists
          .Where(w => w.UserId == userId)
          .Include(w => w.Book)
          .OrderByDescending(w => w.CreatedAt)
          .AsQueryable();

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
        AddedAt = w.CreatedAt
      }).ToList();

      // Create final response with pagination
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

    // Add a book to whitelist
    [HttpPost]
    public async Task<ActionResult<ResponseHelper<WhitelistResponseDTO>>> AddToWhitelist(AddToWhitelistDTO dto)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      // Check if book exists
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
        AddedAt = whitelistItem.CreatedAt
      };

      return Ok(new ResponseHelper<WhitelistResponseDTO>
      {
        Success = true,
        Message = "Book added to whitelist successfully",
        Data = responseDto
      });
    }

    // Remove a book from whitelist
    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseHelper<object>>> RemoveFromWhitelist(int id)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

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

    // Check if a book is in the user's whitelist
    [HttpGet("check/{bookId}")]
    public async Task<ActionResult<ResponseHelper<bool>>> CheckBookInWhitelist(int bookId)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      var exists = await _context.Whitelists
          .AnyAsync(w => w.UserId == userId && w.BookId == bookId);

      return Ok(new ResponseHelper<bool>
      {
        Success = true,
        Message = exists ? "Book is in whitelist" : "Book is not in whitelist",
        Data = exists
      });
    }
  }
}
