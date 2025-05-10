using System;
using System.ComponentModel.DataAnnotations;

namespace Shelf_Society.Models.Entities;

public class Review
{
  public int Id { get; set; }

  public Guid UserId { get; set; }
  public User User { get; set; }

  public int BookId { get; set; }
  public Book Book { get; set; }

  [Required]
  [Range(1, 5)]
  public int Rating { get; set; }

  [StringLength(1000)]
  public string Comment { get; set; }

  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }
}
