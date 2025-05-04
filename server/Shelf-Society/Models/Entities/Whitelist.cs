using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shelf_Society.Models.Entities;

public class Whitelist
{
  [Key]
  public int Id { get; set; }

  [Required]
  public Guid UserId { get; set; }  // Changed to Guid to match your User model

  [Required]
  public int BookId { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  [ForeignKey("UserId")]
  public User User { get; set; }

  [ForeignKey("BookId")]
  public Book Book { get; set; }

}
