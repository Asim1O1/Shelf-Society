using System;

namespace Shelf_Society.Models.Entities;

public class OrderItem
{

  public int Id { get; set; }
  public int OrderId { get; set; }
  public int BookId { get; set; }
  public int Quantity { get; set; }
  public decimal Price { get; set; }
  public decimal Subtotal { get; set; }
  public DateTime CreatedAt { get; set; }

  // Navigation properties
  public virtual Order Order { get; set; }
  public virtual Book Book { get; set; }

}
