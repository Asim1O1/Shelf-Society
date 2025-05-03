namespace Shelf_Society.Helpers;

public class ResponseHelper<T>
{
  public string Message { get; set; } = string.Empty;
  public bool Success { get; set; }
  public T? Data { get; set; }
}
