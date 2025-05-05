// Controllers/CartController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Data;
using Shelf_Society.Helpers;
using Shelf_Society.Models.DTOs.Cart;
using Shelf_Society.Models.Entities;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Shelf_Society.Controllers
{
  [ApiController]
  [Route("api/cart")]
  [Authorize] // Only authenticated users can access cart
  public class CartController : ControllerBase
  {
    private readonly ApplicationDbContext _context;

    public CartController(ApplicationDbContext context)
    {
      _context = context;
    }

    // Get the current user's cart
    [HttpGet]
    public async Task<ActionResult<ResponseHelper<CartResponseDTO>>> GetCart()
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      // Get or create cart
      var cart = await GetOrCreateCartAsync(userId);

      // Get cart items with book details
      var cartItems = await _context.CartItems
          .Where(ci => ci.CartId == cart.Id)
          .Include(ci => ci.Book)
          .ToListAsync();

      // Calculate totals and build response
      var cartResponse = new CartResponseDTO
      {
        Id = cart.Id,
        Items = cartItems.Select(ci => new CartItemDTO
        {
          Id = ci.Id,
          BookId = ci.BookId,
          Title = ci.Book.Title,
          Author = ci.Book.Author,
          ImageUrl = ci.Book.ImageUrl,
          Price = ci.Book.Price,
          Quantity = ci.Quantity,
          Subtotal = ci.Book.Price * ci.Quantity,
          IsAvailable = ci.Book.IsAvailable && ci.Book.StockQuantity >= ci.Quantity
        }).ToList(),
        UpdatedAt = cart.UpdatedAt
      };

      // Calculate totals and discount
      CalculateCartTotals(cartResponse);

      string message = "Cart retrieved successfully";
      if (cartResponse.DiscountPercentage > 0)
      {
        message += $". {cartResponse.DiscountPercentage}% discount applied.";
      }

      return Ok(new ResponseHelper<CartResponseDTO>
      {
        Success = true,
        Message = message,
        Data = cartResponse
      });
    }

    // Add a book to cart
    [HttpPost]
    public async Task<ActionResult<ResponseHelper<CartResponseDTO>>> AddToCart(AddToCartDTO dto)
    {
      if (dto.Quantity <= 0)
      {
        return BadRequest(new ResponseHelper<CartResponseDTO>
        {
          Success = false,
          Message = "Quantity must be greater than zero",
          Data = null
        });
      }

      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      // Check if book exists
      var book = await _context.Books.FindAsync(dto.BookId);
      if (book == null)
      {
        return NotFound(new ResponseHelper<CartResponseDTO>
        {
          Success = false,
          Message = "Book not found",
          Data = null
        });
      }

      // Check if book is available
      if (!book.IsAvailable || book.StockQuantity < dto.Quantity)
      {
        return BadRequest(new ResponseHelper<CartResponseDTO>
        {
          Success = false,
          Message = "Book is not available in the requested quantity",
          Data = null
        });
      }

      // Get or create cart
      var cart = await GetOrCreateCartAsync(userId);

      // Check if book already in cart
      var existingItem = await _context.CartItems
          .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.BookId == dto.BookId);

      if (existingItem != null)
      {
        // Update quantity of existing item
        existingItem.Quantity += dto.Quantity;
        existingItem.UpdatedAt = DateTime.UtcNow;
      }
      else
      {
        // Add new item to cart
        var cartItem = new CartItem
        {
          CartId = cart.Id,
          BookId = dto.BookId,
          Quantity = dto.Quantity,
          CreatedAt = DateTime.UtcNow,
          UpdatedAt = DateTime.UtcNow
        };

        _context.CartItems.Add(cartItem);
      }

      // Update cart timestamp
      cart.UpdatedAt = DateTime.UtcNow;

      await _context.SaveChangesAsync();

      // Return updated cart
      return await GetCart();
    }

    // Update cart item quantity
    [HttpPut("items/{id}")]
    public async Task<ActionResult<ResponseHelper<CartResponseDTO>>> UpdateCartItem(int id, UpdateCartItemDTO dto)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      // Get user's cart
      var cart = await _context.Carts
          .FirstOrDefaultAsync(c => c.UserId == userId);

      if (cart == null)
      {
        return NotFound(new ResponseHelper<CartResponseDTO>
        {
          Success = false,
          Message = "Cart not found",
          Data = null
        });
      }

      // Find the cart item
      var cartItem = await _context.CartItems
          .Include(ci => ci.Book)
          .FirstOrDefaultAsync(ci => ci.Id == id && ci.CartId == cart.Id);

      if (cartItem == null)
      {
        return NotFound(new ResponseHelper<CartResponseDTO>
        {
          Success = false,
          Message = "Cart item not found",
          Data = null
        });
      }

      // Check if requested quantity is valid
      if (dto.Quantity <= 0)
      {
        // Remove item from cart
        _context.CartItems.Remove(cartItem);
      }
      else
      {
        // Check if quantity is available
        if (cartItem.Book.StockQuantity < dto.Quantity)
        {
          return BadRequest(new ResponseHelper<CartResponseDTO>
          {
            Success = false,
            Message = "Requested quantity is not available in stock",
            Data = null
          });
        }

        // Update quantity
        cartItem.Quantity = dto.Quantity;
        cartItem.UpdatedAt = DateTime.UtcNow;
      }

      // Update cart timestamp
      cart.UpdatedAt = DateTime.UtcNow;

      await _context.SaveChangesAsync();

      // Return updated cart
      return await GetCart();
    }

    // Remove item from cart
    [HttpDelete("items/{id}")]
    public async Task<ActionResult<ResponseHelper<CartResponseDTO>>> RemoveFromCart(int id)
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      // Get user's cart
      var cart = await _context.Carts
          .FirstOrDefaultAsync(c => c.UserId == userId);

      if (cart == null)
      {
        return NotFound(new ResponseHelper<CartResponseDTO>
        {
          Success = false,
          Message = "Cart not found",
          Data = null
        });
      }

      // Find the cart item
      var cartItem = await _context.CartItems
          .FirstOrDefaultAsync(ci => ci.Id == id && ci.CartId == cart.Id);

      if (cartItem == null)
      {
        return NotFound(new ResponseHelper<CartResponseDTO>
        {
          Success = false,
          Message = "Cart item not found",
          Data = null
        });
      }

      // Remove item from cart
      _context.CartItems.Remove(cartItem);

      // Update cart timestamp
      cart.UpdatedAt = DateTime.UtcNow;

      await _context.SaveChangesAsync();

      // Return updated cart
      return await GetCart();
    }

    // Clear cart
    [HttpDelete]
    public async Task<ActionResult<ResponseHelper<CartResponseDTO>>> ClearCart()
    {
      var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

      // Get user's cart
      var cart = await _context.Carts
          .FirstOrDefaultAsync(c => c.UserId == userId);

      if (cart == null)
      {
        return NotFound(new ResponseHelper<CartResponseDTO>
        {
          Success = false,
          Message = "Cart not found",
          Data = null
        });
      }

      // Get all cart items
      var cartItems = await _context.CartItems
          .Where(ci => ci.CartId == cart.Id)
          .ToListAsync();

      // Remove all items
      _context.CartItems.RemoveRange(cartItems);

      // Update cart timestamp
      cart.UpdatedAt = DateTime.UtcNow;

      await _context.SaveChangesAsync();

      return Ok(new ResponseHelper<CartResponseDTO>
      {
        Success = true,
        Message = "Cart cleared successfully",
        Data = new CartResponseDTO
        {
          Id = cart.Id,
          Items = new List<CartItemDTO>(),
          TotalItems = 0,
          TotalPrice = 0,
          DiscountPercentage = 0,
          DiscountAmount = 0,
          FinalPrice = 0,
          UpdatedAt = cart.UpdatedAt
        }
      });
    }

    // Private helper methods
    private async Task<Cart> GetOrCreateCartAsync(Guid userId)
    {
      var cart = await _context.Carts
          .FirstOrDefaultAsync(c => c.UserId == userId);

      if (cart == null)
      {
        cart = new Cart
        {
          UserId = userId,
          CreatedAt = DateTime.UtcNow,
          UpdatedAt = DateTime.UtcNow
        };

        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();
      }

      return cart;
    }

    private void CalculateCartTotals(CartResponseDTO cart)
    {
      // Calculate total items and price
      cart.TotalItems = cart.Items.Sum(i => i.Quantity);
      cart.TotalPrice = cart.Items.Sum(i => i.Subtotal);

      // Apply discount: 5% for 5+ books
      cart.DiscountPercentage = 0;
      if (cart.TotalItems >= 5)
      {
        cart.DiscountPercentage = 5;
      }

      // Calculate discount amount and final price
      cart.DiscountAmount = cart.TotalPrice * (cart.DiscountPercentage / 100m);
      cart.FinalPrice = cart.TotalPrice - cart.DiscountAmount;
    }
  }
}
