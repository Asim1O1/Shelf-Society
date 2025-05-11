// Models/DTOs/OrderListItemDTO.cs
public class OrderListItemDTO
{
  public int Id { get; set; }
  public string ClaimCode { get; set; }
  public string Status { get; set; }
  public int TotalItems { get; set; }
  public decimal FinalAmount { get; set; }
  public DateTime OrderDate { get; set; }
  public bool CanCancel { get; set; }
  // Add this new property to hold item names
  public List<string> ItemNames { get; set; } = new List<string>();

  public string CustomerName { get; set; }
  public string CustomerEmail { get; set; }
}
