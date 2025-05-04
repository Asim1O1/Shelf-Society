using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Data;
using Shelf_Society.Helpers;
using Shelf_Society.Models.DTOs.Book;
using Shelf_Society.Models.Entities;

namespace Shelf_Society.Controllers;

[ApiController]
[Route("api/books")]

public class BookController : ControllerBase
{
  private readonly ApplicationDbContext _context;

  public BookController(ApplicationDbContext context)
  {
    _context = context;
  }

  [HttpGet]
  public async Task<ActionResult<ResponseHelper<PaginationHelper<BookResponseDTO>>>> GetBooks(
     [FromQuery] int pageNumber = 1,
     [FromQuery] int pageSize = 10,
     [FromQuery] string? search = null,
     [FromQuery] string? sortBy = null,
     [FromQuery] string? genre = null,
     [FromQuery] string? author = null,
     [FromQuery] string? language = null,
     [FromQuery] decimal? minPrice = null,
     [FromQuery] decimal? maxPrice = null)
  {
    // Start with base query
    var query = _context.Books.AsQueryable();

    // Apply filters if provided
    if (!string.IsNullOrEmpty(search))
    {
      search = search.ToLower();
      query = query.Where(b =>
          b.Title.ToLower().Contains(search) ||
          b.Author.ToLower().Contains(search) ||
          b.Description.ToLower().Contains(search) ||
          b.ISBN.ToLower().Contains(search));
    }

    if (!string.IsNullOrEmpty(genre))
    {
      query = query.Where(b => b.Genre.ToLower() == genre.ToLower());
    }

    if (!string.IsNullOrEmpty(author))
    {
      query = query.Where(b => b.Author.ToLower().Contains(author.ToLower()));
    }

    if (!string.IsNullOrEmpty(language))
    {
      query = query.Where(b => b.Language.ToLower() == language.ToLower());
    }

    if (minPrice.HasValue)
    {
      query = query.Where(b => b.Price >= minPrice.Value);
    }

    if (maxPrice.HasValue)
    {
      query = query.Where(b => b.Price <= maxPrice.Value);
    }

    // Apply sorting
    switch (sortBy?.ToLower())
    {
      case "title_asc":
        query = query.OrderBy(b => b.Title);
        break;
      case "title_desc":
        query = query.OrderByDescending(b => b.Title);
        break;
      case "price_asc":
        query = query.OrderBy(b => b.Price);
        break;
      case "price_desc":
        query = query.OrderByDescending(b => b.Price);
        break;
      case "date_asc":
        query = query.OrderBy(b => b.PublicationDate);
        break;
      case "date_desc":
        query = query.OrderByDescending(b => b.PublicationDate);
        break;
      case "rating_desc":
        query = query.OrderByDescending(b => b.Rating);
        break;
      default:
        query = query.OrderBy(b => b.Title); // Default sorting
        break;
    }

    // Get paginated result
    var pagedBooks = await PaginationHelper<Book>.CreateAsync(query, pageNumber, pageSize);

    // Map to DTOs
    var bookDtos = pagedBooks.Items.Select(book => new BookResponseDTO
    {
      Id = book.Id,
      Title = book.Title,
      Author = book.Author,
      ISBN = book.ISBN,
      Description = book.Description,
      Price = book.Price,
      Format = book.Format.ToString(),
      Genre = book.Genre,
      Language = book.Language,
      StockQuantity = book.StockQuantity,
      Rating = book.Rating,
      PublicationDate = book.PublicationDate,
      Publisher = book.Publisher,
      CreatedAt = book.CreatedAt,
      UpdatedAt = book.UpdatedAt,
      IsAvailable = book.IsAvailable,
      ImageUrl = book.ImageUrl
    }).ToList();

    // Create final response with pagination
    var pagedResponse = new PaginationHelper<BookResponseDTO>(
        bookDtos,
        pagedBooks.TotalCount,
        pagedBooks.PageNumber,
        pagedBooks.PageSize);

    string message = pagedBooks.TotalCount > 0
   ? "Books retrieved successfully"
   : "No books found matching the criteria";

    return Ok(new ResponseHelper<PaginationHelper<BookResponseDTO>>
    {
      Success = true,
      Message = message,
      Data = pagedResponse
    });
  }

  [HttpGet("{id}")]
  public async Task<ActionResult<ResponseHelper<BookResponseDTO>>> GetBookById(int id)
  {
    var book = await _context.Books.FindAsync(id);
    if (book == null)
    {
      return NotFound(new ResponseHelper<BookResponseDTO>
      {
        Success = false,
        Message = "Book not found",
        Data = null
      });
    }

    var bookDto = new BookResponseDTO
    {
      Id = book.Id,
      Title = book.Title,
      Author = book.Author,
      ISBN = book.ISBN,
      Description = book.Description,
      Price = book.Price,
      Format = book.Format.ToString(),
      Genre = book.Genre,
      Language = book.Language,
      StockQuantity = book.StockQuantity,
      Rating = book.Rating,
      PublicationDate = book.PublicationDate,
      Publisher = book.Publisher,
      CreatedAt = book.CreatedAt,
      UpdatedAt = book.UpdatedAt,
      IsAvailable = book.IsAvailable,
      ImageUrl = book.ImageUrl
    };

    return Ok(new ResponseHelper<BookResponseDTO>
    {
      Success = true,
      Message = "Book retrieved successfully",
      Data = bookDto
    });
  }

  [HttpPost]

  [Authorize(Roles = "Admin")]
  public async Task<ActionResult<ResponseHelper<BookResponseDTO>>> CreateBook(CreateBookDTO dto)
  {
    var book = new Book
    {
      Title = dto.Title,
      Author = dto.Author,
      ISBN = dto.ISBN,
      Description = dto.Description,
      Price = dto.Price,
      Format = dto.Format,
      Genre = dto.Genre,
      Language = dto.Language,
      StockQuantity = dto.StockQuantity,
      PublicationDate = dto.PublicationDate,
      Publisher = dto.Publisher,
      ImageUrl = dto.ImageUrl,
      CreatedAt = DateTime.UtcNow,
      IsAvailable = true,
      Rating = 0
    };

    _context.Books.Add(book);
    await _context.SaveChangesAsync();

    var bookDto = new BookResponseDTO
    {
      Id = book.Id,
      Title = book.Title,
      Author = book.Author,
      ISBN = book.ISBN,
      Description = book.Description,
      Price = book.Price,
      Format = book.Format.ToString(),
      Genre = book.Genre,
      Language = book.Language,
      StockQuantity = book.StockQuantity,
      Rating = book.Rating,
      PublicationDate = book.PublicationDate,
      Publisher = book.Publisher,
      CreatedAt = book.CreatedAt,
      UpdatedAt = book.UpdatedAt,
      IsAvailable = book.IsAvailable,
      ImageUrl = book.ImageUrl
    };

    return CreatedAtAction(nameof(GetBookById), new { id = book.Id }, new ResponseHelper<BookResponseDTO>
    {
      Success = true,
      Message = "Book created successfully",
      Data = bookDto
    });
  }

  [HttpPut("{id}")]
  [Authorize(Roles = "Admin")]
  public async Task<ActionResult<ResponseHelper<BookResponseDTO>>> UpdateBook(int id, UpdateBookDTO dto)
  {
    var book = await _context.Books.FindAsync(id);
    if (book == null)
    {
      return NotFound(new ResponseHelper<BookResponseDTO>
      {
        Success = false,
        Message = "Book not found",
        Data = null
      });
    }

    // Update only provided fields
    if (!string.IsNullOrEmpty(dto.Title))
      book.Title = dto.Title;
    if (!string.IsNullOrEmpty(dto.Author))
      book.Author = dto.Author;
    if (!string.IsNullOrEmpty(dto.Description))
      book.Description = dto.Description;
    if (dto.Price.HasValue)
      book.Price = dto.Price.Value;
    if (!string.IsNullOrEmpty(dto.Genre))
      book.Genre = dto.Genre;
    if (!string.IsNullOrEmpty(dto.Language))
      book.Language = dto.Language;
    if (dto.StockQuantity.HasValue)
      book.StockQuantity = dto.StockQuantity.Value;
    if (!string.IsNullOrEmpty(dto.Publisher))
      book.Publisher = dto.Publisher;
    if (!string.IsNullOrEmpty(dto.ImageUrl))
      book.ImageUrl = dto.ImageUrl;

    book.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();

    var bookDto = new BookResponseDTO
    {
      Id = book.Id,
      Title = book.Title,
      Author = book.Author,
      ISBN = book.ISBN,
      Description = book.Description,
      Price = book.Price,
      Format = book.Format.ToString(),
      Genre = book.Genre,
      Language = book.Language,
      StockQuantity = book.StockQuantity,
      Rating = book.Rating,
      PublicationDate = book.PublicationDate,
      Publisher = book.Publisher,
      CreatedAt = book.CreatedAt,
      UpdatedAt = book.UpdatedAt,
      IsAvailable = book.IsAvailable,
      ImageUrl = book.ImageUrl
    };

    return Ok(new ResponseHelper<BookResponseDTO>
    {
      Success = true,
      Message = "Book updated successfully",
      Data = bookDto
    });
  }

  [HttpDelete("{id}")]
  [Authorize(Roles = "Admin")]
  public async Task<ActionResult<ResponseHelper<object>>> DeleteBook(int id)
  {
    var book = await _context.Books.FindAsync(id);
    if (book == null)
    {
      return NotFound(new ResponseHelper<object>
      {
        Success = false,
        Message = "Book not found",
        Data = null
      });
    }

    _context.Books.Remove(book);
    await _context.SaveChangesAsync();

    return Ok(new ResponseHelper<object>
    {
      Success = true,
      Message = "Book deleted successfully",
      Data = null
    });
  }
}
