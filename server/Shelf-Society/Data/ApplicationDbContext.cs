using System;
using Microsoft.EntityFrameworkCore;
using Shelf_Society.Models.Entities;

namespace Shelf_Society.Data;

public class ApplicationDbContext : DbContext
{
  public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
  {
  }

  public DbSet<User> Users { get; set; } = null!;
}
