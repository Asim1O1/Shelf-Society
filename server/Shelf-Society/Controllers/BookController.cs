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
[Authorize]
public class BookController : ControllerBase
{
  private readonly ApplicationDbContext _context;

  public BookController(ApplicationDbContext context)
  {
    _context = context;
  }

  [HttpGet]
  public async Task<ActionResult<ResponseHelper<List<BookResponseDTO>>>> GetBooks()
  {
    var books = await _context.Books.ToListAsync();

    var bookDtos = books.Select(book => new BookResponseDTO
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

    return Ok(new ResponseHelper<List<BookResponseDTO>>
    {
      Success = true,
      Message = "Books retrieved successfully",
      Data = bookDtos
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
