// Controllers/ReviewController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Data;
using Shelf_Society.Helpers;
using Shelf_Society.Models.DTOs.Reviews;
using Shelf_Society.Models.Entities;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Shelf_Society.Controllers
{
  [ApiController]
  [Route("api/reviews")]
  public class ReviewController : ControllerBase
  {
    private readonly ApplicationDbContext _context;

    public ReviewController(ApplicationDbContext context)
    {
      _context = context;
    }

    // Get all reviews for a book
    [HttpGet("books/{bookId}")]
    public async Task<ActionResult<ResponseHelper<BookReviewsDTO>>> GetBookReviews(int bookId)
    {
      var book = await _context.Books
          .Include(b => b.Reviews)
          .ThenInclude(r => r.User)
          .FirstOrDefaultAsync(b => b.Id == bookId);

      if (book == null)
      {
        return NotFound(new ResponseHelper<BookReviewsDTO>
        {
          Success = false,
          Message = "Book not found",
          Data = null
        });
      }

      var bookReviewsDto = new BookReviewsDTO
      {
        BookId = book.Id,
        Title = book.Title,
        Author = book.Author,
        ImageUrl = book.ImageUrl,
        AverageRating = book.AverageRating,
        ReviewCount = book.ReviewCount,
        Reviews = book.Reviews.Select(r => new ReviewDTO
        {
          Id = r.Id,
          BookId = r.BookId,
          BookTitle = book.Title,
          BookImageUrl = book.ImageUrl,
          UserName = $"{r.User.FirstName} {r.User.LastName}",
          Rating = r.Rating,
          Comment = r.Comment,
          CreatedAt = r.CreatedAt
        }).OrderByDescending(r => r.CreatedAt).ToList()
      };

      return Ok(new ResponseHelper<BookReviewsDTO>
      {
        Success = true,
        Message = "Book reviews retrieved successfully",
        Data = bookReviewsDto
      });
    }

    // Get a user's reviews
    [Authorize]
    [HttpGet("user")]
    public async Task<ActionResult<ResponseHelper<UserReviewsDTO>>> GetUserReviews()
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      var user = await _context.Users
          .Include(u => u.Reviews)
          .ThenInclude(r => r.Book)
          .FirstOrDefaultAsync(u => u.Id == userId);

      if (user == null)
      {
        return NotFound(new ResponseHelper<UserReviewsDTO>
        {
          Success = false,
          Message = "User not found",
          Data = null
        });
      }

      var userReviewsDto = new UserReviewsDTO
      {
        UserId = user.Id,
        UserName = $"{user.FirstName} {user.LastName}",
        ReviewCount = user.Reviews.Count,
        Reviews = user.Reviews.Select(r => new ReviewDTO
        {
          Id = r.Id,
          BookId = r.BookId,
          BookTitle = r.Book.Title,
          BookImageUrl = r.Book.ImageUrl,
          UserName = $"{user.FirstName} {user.LastName}",
          Rating = r.Rating,
          Comment = r.Comment,
          CreatedAt = r.CreatedAt
        }).OrderByDescending(r => r.CreatedAt).ToList()
      };

      return Ok(new ResponseHelper<UserReviewsDTO>
      {
        Success = true,
        Message = "User reviews retrieved successfully",
        Data = userReviewsDto
      });
    }

    // Create a review - only if user has purchased the book
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ResponseHelper<ReviewDTO>>> CreateReview(CreateReviewDTO dto)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      // Check if the book exists
      var book = await _context.Books.FindAsync(dto.BookId);
      if (book == null)
      {
        return NotFound(new ResponseHelper<ReviewDTO>
        {
          Success = false,
          Message = "Book not found",
          Data = null
        });
      }

      // Check if user has already reviewed this book
      var existingReview = await _context.Reviews
          .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == dto.BookId);

      if (existingReview != null)
      {
        return BadRequest(new ResponseHelper<ReviewDTO>
        {
          Success = false,
          Message = "You have already reviewed this book",
          Data = null
        });
      }

      // Verify that the user has purchased and received the book
      var hasPurchased = await HasUserPurchasedBook(userId, dto.BookId);
      if (!hasPurchased)
      {
        return BadRequest(new ResponseHelper<ReviewDTO>
        {
          Success = false,
          Message = "You can only review books you have purchased",
          Data = null
        });
      }

      // Create the review
      var review = new Review
      {
        UserId = userId,
        BookId = dto.BookId,
        Rating = dto.Rating,
        Comment = dto.Comment,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
      };

      _context.Reviews.Add(review);
      await _context.SaveChangesAsync();

      // Update book's average rating and review count
      await UpdateBookRatingStatistics(dto.BookId);

      // Get user info for the response
      var user = await _context.Users.FindAsync(userId);

      var reviewDto = new ReviewDTO
      {
        Id = review.Id,
        BookId = review.BookId,
        BookTitle = book.Title,
        BookImageUrl = book.ImageUrl,
        UserName = $"{user.FirstName} {user.LastName}",
        Rating = review.Rating,
        Comment = review.Comment,
        CreatedAt = review.CreatedAt
      };

      return CreatedAtAction(nameof(GetBookReviews), new { bookId = dto.BookId },
          new ResponseHelper<ReviewDTO>
          {
            Success = true,
            Message = "Review created successfully",
            Data = reviewDto
          });
    }

    // Update a review - only the user who created it
    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ResponseHelper<ReviewDTO>>> UpdateReview(int id, UpdateReviewDTO dto)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      var review = await _context.Reviews
          .Include(r => r.Book)
          .Include(r => r.User)
          .FirstOrDefaultAsync(r => r.Id == id);

      if (review == null)
      {
        return NotFound(new ResponseHelper<ReviewDTO>
        {
          Success = false,
          Message = "Review not found",
          Data = null
        });
      }

      // Check if user is the author of the review
      if (review.UserId != userId)
      {
        return Forbid();
      }

      // Update review
      review.Rating = dto.Rating;
      review.Comment = dto.Comment;
      review.UpdatedAt = DateTime.UtcNow;

      await _context.SaveChangesAsync();

      // Update book's average rating
      await UpdateBookRatingStatistics(review.BookId);

      var reviewDto = new ReviewDTO
      {
        Id = review.Id,
        BookId = review.BookId,
        BookTitle = review.Book.Title,
        BookImageUrl = review.Book.ImageUrl,
        UserName = $"{review.User.FirstName} {review.User.LastName}",
        Rating = review.Rating,
        Comment = review.Comment,
        CreatedAt = review.CreatedAt
      };

      return Ok(new ResponseHelper<ReviewDTO>
      {
        Success = true,
        Message = "Review updated successfully",
        Data = reviewDto
      });
    }

    // Delete a review - only the user who created it
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseHelper<object>>> DeleteReview(int id)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      var review = await _context.Reviews.FindAsync(id);
      if (review == null)
      {
        return NotFound(new ResponseHelper<object>
        {
          Success = false,
          Message = "Review not found",
          Data = null
        });
      }

      // Check if user is the author of the review
      if (review.UserId != userId)
      {
        return Forbid();
      }

      _context.Reviews.Remove(review);
      await _context.SaveChangesAsync();

      // Update book's average rating
      await UpdateBookRatingStatistics(review.BookId);

      return Ok(new ResponseHelper<object>
      {
        Success = true,
        Message = "Review deleted successfully",
        Data = null
      });
    }

    // Helper method to check if user has purchased the book
    private async Task<bool> HasUserPurchasedBook(Guid userId, int bookId)
    {
      return await _context.OrderItems
          .Include(oi => oi.Order)
          .AnyAsync(oi =>
              oi.BookId == bookId &&
              oi.Order.UserId == userId &&
              oi.Order.Status == OrderStatus.Completed);
    }

    // Helper method to update book rating statistics
    private async Task UpdateBookRatingStatistics(int bookId)
    {
      var book = await _context.Books.FindAsync(bookId);
      if (book != null)
      {
        var reviews = await _context.Reviews
            .Where(r => r.BookId == bookId)
            .ToListAsync();

        book.ReviewCount = reviews.Count;
        book.AverageRating = reviews.Any() ? reviews.Average(r => r.Rating) : null;

        await _context.SaveChangesAsync();
      }
    }
  }
}
