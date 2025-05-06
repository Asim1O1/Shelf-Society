// Controllers/DiscountController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Data;
using Shelf_Society.Helpers;
using Shelf_Society.Models.DTOs.Discount;
using Shelf_Society.Models.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shelf_Society.Controllers
{
  [ApiController]
  [Route("api/discounts")]
  [Authorize(Roles = "Admin")] // Only admins can manage discounts
  public class DiscountController : ControllerBase
  {
    private readonly ApplicationDbContext _context;

    public DiscountController(ApplicationDbContext context)
    {
      _context = context;
    }

    // Get all discounts
    [HttpGet]
    public async Task<ActionResult<ResponseHelper<PaginationHelper<DiscountResponseDTO>>>> GetDiscounts(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? activeOnly = null)
    {

      var now = DateTime.UtcNow;
      var query = _context.Discounts
          .Include(d => d.Book)
          .AsQueryable();

      // Filter by active status if requested
      if (activeOnly == true)
      {

        query = query.Where(d => d.StartDate <= now && d.EndDate >= now);
      }

      // Order by end date descending (most recent first)
      query = query.OrderByDescending(d => d.EndDate);

      // Apply pagination
      var pagedDiscounts = await PaginationHelper<Discount>.CreateAsync(query, pageNumber, pageSize);


      var discountDtos = pagedDiscounts.Items.Select(d => new DiscountResponseDTO
      {
        Id = d.Id,
        BookId = d.BookId,
        BookTitle = d.Book.Title,
        DiscountPercentage = d.DiscountPercentage,
        OnSale = d.OnSale,
        StartDate = d.StartDate,
        EndDate = d.EndDate,
        IsActive = d.StartDate <= now && d.EndDate >= now
      }).ToList();

      // Create final response with pagination
      var pagedResponse = new PaginationHelper<DiscountResponseDTO>(
          discountDtos,
          pagedDiscounts.TotalCount,
          pagedDiscounts.PageNumber,
          pagedDiscounts.PageSize);

      return Ok(new ResponseHelper<PaginationHelper<DiscountResponseDTO>>
      {
        Success = true,
        Message = "Discounts retrieved successfully",
        Data = pagedResponse
      });
    }

    // Get discount by id
    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseHelper<DiscountResponseDTO>>> GetDiscountById(int id)
    {
      var discount = await _context.Discounts
          .Include(d => d.Book)
          .FirstOrDefaultAsync(d => d.Id == id);

      if (discount == null)
      {
        return NotFound(new ResponseHelper<DiscountResponseDTO>
        {
          Success = false,
          Message = "Discount not found",
          Data = null
        });
      }

      var now = DateTime.UtcNow;
      var discountDto = new DiscountResponseDTO
      {
        Id = discount.Id,
        BookId = discount.BookId,
        BookTitle = discount.Book.Title,
        DiscountPercentage = discount.DiscountPercentage,
        OnSale = discount.OnSale,
        StartDate = discount.StartDate,
        EndDate = discount.EndDate,
        IsActive = discount.StartDate <= now && discount.EndDate >= now
      };

      return Ok(new ResponseHelper<DiscountResponseDTO>
      {
        Success = true,
        Message = "Discount retrieved successfully",
        Data = discountDto
      });
    }

    // Create new discount
    [HttpPost]
    public async Task<ActionResult<ResponseHelper<DiscountResponseDTO>>> CreateDiscount(CreateDiscountDTO dto)
    {
      // Validate input
      if (dto.DiscountPercentage <= 0 || dto.DiscountPercentage > 100)
      {
        return BadRequest(new ResponseHelper<DiscountResponseDTO>
        {
          Success = false,
          Message = "Discount percentage must be between 0 and 100",
          Data = null
        });
      }

      if (dto.StartDate >= dto.EndDate)
      {
        return BadRequest(new ResponseHelper<DiscountResponseDTO>
        {
          Success = false,
          Message = "End date must be after start date",
          Data = null
        });
      }

      // Check if book exists
      var book = await _context.Books.FindAsync(dto.BookId);
      if (book == null)
      {
        return NotFound(new ResponseHelper<DiscountResponseDTO>
        {
          Success = false,
          Message = "Book not found",
          Data = null
        });
      }

      // Check if book already has an active discount
      var existingDiscount = await _context.Discounts
          .FirstOrDefaultAsync(d => d.BookId == dto.BookId && d.EndDate > DateTime.UtcNow);

      if (existingDiscount != null)
      {
        return BadRequest(new ResponseHelper<DiscountResponseDTO>
        {
          Success = false,
          Message = "Book already has an active discount",
          Data = null
        });
      }

      // Create new discount
      var discount = new Discount
      {
        BookId = dto.BookId,
        DiscountPercentage = dto.DiscountPercentage,
        OnSale = dto.OnSale,
        StartDate = dto.StartDate.ToUniversalTime(),
        EndDate = dto.EndDate.ToUniversalTime(),
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
      };

      _context.Discounts.Add(discount);
      await _context.SaveChangesAsync();

      var discountDto = new DiscountResponseDTO
      {
        Id = discount.Id,
        BookId = discount.BookId,
        BookTitle = book.Title,
        DiscountPercentage = discount.DiscountPercentage,
        OnSale = discount.OnSale,
        StartDate = discount.StartDate,
        EndDate = discount.EndDate,
        IsActive = discount.StartDate <= DateTime.UtcNow && discount.EndDate >= DateTime.UtcNow
      };

      return CreatedAtAction(nameof(GetDiscountById), new { id = discount.Id }, new ResponseHelper<DiscountResponseDTO>
      {
        Success = true,
        Message = "Discount created successfully",
        Data = discountDto
      });
    }

    // Update discount
    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseHelper<DiscountResponseDTO>>> UpdateDiscount(int id, UpdateDiscountDTO dto)
    {
      var discount = await _context.Discounts
          .Include(d => d.Book)
          .FirstOrDefaultAsync(d => d.Id == id);

      if (discount == null)
      {
        return NotFound(new ResponseHelper<DiscountResponseDTO>
        {
          Success = false,
          Message = "Discount not found",
          Data = null
        });
      }

      // Validate discount percentage if provided
      if (dto.DiscountPercentage.HasValue && (dto.DiscountPercentage <= 0 || dto.DiscountPercentage > 100))
      {
        return BadRequest(new ResponseHelper<DiscountResponseDTO>
        {
          Success = false,
          Message = "Discount percentage must be between 0 and 100",
          Data = null
        });
      }

      // Validate dates if both are provided
      if (dto.StartDate.HasValue && dto.EndDate.HasValue && dto.StartDate >= dto.EndDate)
      {
        return BadRequest(new ResponseHelper<DiscountResponseDTO>
        {
          Success = false,
          Message = "End date must be after start date",
          Data = null
        });
      }

      // Update fields if provided
      if (dto.DiscountPercentage.HasValue)
        discount.DiscountPercentage = dto.DiscountPercentage.Value;

      if (dto.OnSale.HasValue)
        discount.OnSale = dto.OnSale.Value;

      if (dto.StartDate.HasValue)
        discount.StartDate = dto.StartDate.Value.ToUniversalTime();

      if (dto.EndDate.HasValue)
        discount.EndDate = dto.EndDate.Value.ToUniversalTime();

      discount.UpdatedAt = DateTime.UtcNow;

      await _context.SaveChangesAsync();

      var now = DateTime.UtcNow;
      var discountDto = new DiscountResponseDTO
      {
        Id = discount.Id,
        BookId = discount.BookId,
        BookTitle = discount.Book.Title,
        DiscountPercentage = discount.DiscountPercentage,
        OnSale = discount.OnSale,
        StartDate = discount.StartDate,
        EndDate = discount.EndDate,
        IsActive = discount.StartDate <= now && discount.EndDate >= now
      };

      return Ok(new ResponseHelper<DiscountResponseDTO>
      {
        Success = true,
        Message = "Discount updated successfully",
        Data = discountDto
      });
    }

    // Delete discount
    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseHelper<object>>> DeleteDiscount(int id)
    {
      var discount = await _context.Discounts.FindAsync(id);

      if (discount == null)
      {
        return NotFound(new ResponseHelper<object>
        {
          Success = false,
          Message = "Discount not found",
          Data = null
        });
      }

      _context.Discounts.Remove(discount);
      await _context.SaveChangesAsync();

      return Ok(new ResponseHelper<object>
      {
        Success = true,
        Message = "Discount deleted successfully",
        Data = null
      });
    }
  }
}
