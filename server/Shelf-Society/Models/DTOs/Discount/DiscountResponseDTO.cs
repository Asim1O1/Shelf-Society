using System;

namespace Shelf_Society.Models.DTOs.Discount;

public class DiscountResponseDTO
{
  public int Id { get; set; }
  public int BookId { get; set; }
  public string BookTitle { get; set; }
  public decimal DiscountPercentage { get; set; }
  public bool OnSale { get; set; }
  public DateTime StartDate { get; set; }
  public DateTime EndDate { get; set; }
  public bool IsActive { get; set; }

}
