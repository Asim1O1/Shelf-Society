using System;

namespace Shelf_Society.Models.DTOs.Discount;

public class UpdateDiscountDTO
{
  public decimal? DiscountPercentage { get; set; }
  public bool? OnSale { get; set; }
  public DateTime? StartDate { get; set; }
  public DateTime? EndDate { get; set; }

}
