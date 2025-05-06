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
  public DbSet<Cart> Carts { get; set; } = null!;
  public DbSet<CartItem> CartItems { get; set; } = null!;
  public DbSet<Order> Orders { get; set; } = null!;
  public DbSet<OrderItem> OrderItems { get; set; } = null!;

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    // Configure the relationship between Book and BookImage
    modelBuilder.Entity<BookImage>()
        .HasOne(bi => bi.Book)
        .WithMany(b => b.AdditionalImages)
        .HasForeignKey(bi => bi.BookId)
        .OnDelete(DeleteBehavior.Cascade);

    // Configure Cart relationships
    modelBuilder.Entity<Cart>()
        .HasOne(c => c.User)
        .WithOne()
        .HasForeignKey<Cart>(c => c.UserId)
        .OnDelete(DeleteBehavior.Cascade);

    // Configure CartItem relationships
    modelBuilder.Entity<CartItem>()
        .HasOne(ci => ci.Cart)
        .WithMany(c => c.Items)
        .HasForeignKey(ci => ci.CartId)
        .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<CartItem>()
        .HasOne(ci => ci.Book)
        .WithMany()
        .HasForeignKey(ci => ci.BookId)
        .OnDelete(DeleteBehavior.Restrict);


    // Configure Order relationships
    modelBuilder.Entity<Order>()
        .HasOne(o => o.User)
        .WithMany()
        .HasForeignKey(o => o.UserId)
        .OnDelete(DeleteBehavior.Restrict);

    // Configure OrderItem relationships
    modelBuilder.Entity<OrderItem>()
        .HasOne(oi => oi.Order)
        .WithMany(o => o.Items)
        .HasForeignKey(oi => oi.OrderId)
        .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<OrderItem>()
        .HasOne(oi => oi.Book)
        .WithMany()
        .HasForeignKey(oi => oi.BookId)
        .OnDelete(DeleteBehavior.Restrict);

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
