using System;

namespace Shelf_Society.Models.Entities;

public class Discount
{
  public int Id { get; set; }
  public int BookId { get; set; }
  public decimal DiscountPercentage { get; set; }
  public bool OnSale { get; set; }
  public DateTime StartDate { get; set; }
  public DateTime EndDate { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }

  // Navigation property
  public virtual Book Book { get; set; }

}
