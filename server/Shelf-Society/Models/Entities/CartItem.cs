using System;

namespace Shelf_Society.Models.Entities;

public class CartItem
{
  public int Id { get; set; }
  public int CartId { get; set; }
  public int BookId { get; set; }
  public int Quantity { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }

  // Navigation properties
  public virtual Cart Cart { get; set; }
  public virtual Book Book { get; set; }

}
