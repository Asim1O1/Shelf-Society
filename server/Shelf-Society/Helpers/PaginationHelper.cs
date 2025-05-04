// Models/Helpers/PaginationHelper.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Shelf_Society.Helpers
{
  public class PaginationHelper<T>
  {
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }
    public bool HasPrevious => PageNumber > 1;
    public bool HasNext => PageNumber < TotalPages;
    public List<T> Items { get; set; }

    public PaginationHelper(List<T> items, int count, int pageNumber, int pageSize)
    {
      PageNumber = pageNumber;
      PageSize = pageSize;
      TotalCount = count;
      TotalPages = (int)Math.Ceiling(count / (double)pageSize);
      Items = items;
    }

    public static async Task<PaginationHelper<T>> CreateAsync(
        IQueryable<T> source, int pageNumber, int pageSize)
    {
      var count = await source.CountAsync();
      var items = await source.Skip((pageNumber - 1) * pageSize)
          .Take(pageSize).ToListAsync();

      return new PaginationHelper<T>(items, count, pageNumber, pageSize);
    }
  }
}
