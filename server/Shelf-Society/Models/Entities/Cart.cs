using System;

namespace Shelf_Society.Models.Entities;

public class Cart
{
  public int Id { get; set; }
  public Guid UserId { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }

  // Navigation properties
  public virtual User User { get; set; }
  public virtual ICollection<CartItem> Items { get; set; } = new List<CartItem>();

}
