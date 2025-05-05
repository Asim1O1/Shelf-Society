using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Shelf_Society.Models.Entities;

namespace Shelf_Society.Data;

public class ApplicationDbContext : DbContext
{
  public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
  {
  }

  public DbSet<User> Users { get; set; } = null!;
  public DbSet<Book> Books { get; set; } = null!;
  public DbSet<BookImage> BookImages { get; set; } = null!;
  public DbSet<Whitelist> Whitelists { get; set; } = null!;

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    // Configure the relationship between Book and BookImage
    modelBuilder.Entity<BookImage>()
        .HasOne(bi => bi.Book)
        .WithMany(b => b.AdditionalImages)
        .HasForeignKey(bi => bi.BookId)
        .OnDelete(DeleteBehavior.Cascade);

    // Add DateTime converter for all DateTime properties to ensure UTC
    foreach (var entityType in modelBuilder.Model.GetEntityTypes())
    {
      foreach (var property in entityType.GetProperties())
      {
        if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
        {
          property.SetValueConverter(new ValueConverter<DateTime, DateTime>(
              // When writing to database:
              v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
              // When reading from database:
              v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
          ));
        }
      }
    }
  }
}
