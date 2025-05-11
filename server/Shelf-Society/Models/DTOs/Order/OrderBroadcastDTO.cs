// Models/DTOs/Order/OrderBroadcastDTO.cs
using System;
using System.Collections.Generic;

namespace Shelf_Society.Models.DTOs.Order
{
  public class OrderBroadcastDTO
  {
    public int OrderId { get; set; }
    public int TotalItems { get; set; }
    public List<OrderBroadcastBookDTO> Books { get; set; }
    public string Message { get; set; }
    public DateTime CompletedAt { get; set; }
  }

  public class OrderBroadcastBookDTO
  {
    public int BookId { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    public int Quantity { get; set; }
  }
}
