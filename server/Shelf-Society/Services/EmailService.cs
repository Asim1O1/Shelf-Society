// Services/EmailService.cs
using Microsoft.Extensions.Configuration;
using Shelf_Society.Models.Entities;
using System;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Shelf_Society.Services
{
  public interface IEmailService
  {
    Task SendOrderConfirmationEmailAsync(Order order, User user);
  }

  public class EmailService : IEmailService
  {
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
      _configuration = configuration;
    }

    public async Task SendOrderConfirmationEmailAsync(Order order, User user)
    {
      try
      {
        // Log order details
        Console.WriteLine("============= ORDER DETAILS =============");
        Console.WriteLine($"Order ID: {order.Id}");
        Console.WriteLine($"Order Date: {order.OrderDate}");
        Console.WriteLine($"Claim Code: {order.ClaimCode}");
        Console.WriteLine($"Customer: {user.FirstName} {user.LastName} ({user.Email})");
        Console.WriteLine($"Total Items: {order.Items.Count}");
        Console.WriteLine($"Subtotal: ${order.TotalAmount:F2}");

        if (order.DiscountPercentage > 0)
        {
          Console.WriteLine($"Discount: {order.DiscountPercentage}% (-${order.DiscountAmount:F2})");
        }

        Console.WriteLine($"Final Amount: ${order.FinalAmount:F2}");
        Console.WriteLine("--------- Order Items ---------");

        foreach (var item in order.Items)
        {
          Console.WriteLine($"- {item.Title ?? "Unknown Book"} x{item.Quantity} @ ${item.Price:F2} = ${item.Subtotal:F2}");
        }

        Console.WriteLine("======================================");

        var smtpServer = _configuration["EmailSettings:SmtpServer"];
        var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]);
        var smtpUsername = _configuration["EmailSettings:Username"];
        var smtpPassword = _configuration["EmailSettings:Password"];
        var senderEmail = _configuration["EmailSettings:SenderEmail"];
        var senderName = _configuration["EmailSettings:SenderName"];

        Console.WriteLine($"Sending email via {smtpServer}:{smtpPort} from {senderEmail}");

        var client = new SmtpClient(smtpServer)
        {
          Port = smtpPort,
          Credentials = new NetworkCredential(smtpUsername, smtpPassword),
          EnableSsl = true,
        };

        var mailMessage = new MailMessage
        {
          From = new MailAddress(senderEmail, senderName),
          Subject = "Your Order Confirmation - Shelf Society",
          Body = GenerateOrderConfirmationEmail(order, user),
          IsBodyHtml = true,
        };

        mailMessage.To.Add(user.Email);

        Console.WriteLine($"Sending order confirmation email to {user.Email}...");
        await client.SendMailAsync(mailMessage);
        Console.WriteLine("Email sent successfully!");
      }
      catch (Exception ex)
      {
        // Log the error but don't throw - we don't want the order to fail if email fails
        Console.WriteLine($"ERROR: Failed to send email: {ex.Message}");
        Console.WriteLine($"Exception details: {ex}");
      }
    }

    private string GenerateOrderConfirmationEmail(Order order, User user)
    {
      var sb = new StringBuilder();

      sb.AppendLine($"<h1>Order Confirmation</h1>");
      sb.AppendLine($"<p>Dear {user.FirstName} {user.LastName},</p>");
      sb.AppendLine($"<p>Thank you for your order with Shelf Society. Your order has been received and is being processed.</p>");

      sb.AppendLine($"<h2>Order Details</h2>");
      sb.AppendLine($"<p><strong>Order Number:</strong> {order.Id}</p>");
      sb.AppendLine($"<p><strong>Order Date:</strong> {order.OrderDate.ToString("MMM dd, yyyy HH:mm")}</p>");
      sb.AppendLine($"<p><strong>Claim Code:</strong> <span style='font-size: 24px; font-weight: bold;'>{order.ClaimCode}</span></p>");

      sb.AppendLine($"<h2>Order Summary</h2>");
      sb.AppendLine("<table style='width: 100%; border-collapse: collapse;'>");
      sb.AppendLine("<tr style='background-color: #f2f2f2;'>");
      sb.AppendLine("<th style='padding: 8px; text-align: left; border: 1px solid #ddd;'>Item</th>");
      sb.AppendLine("<th style='padding: 8px; text-align: left; border: 1px solid #ddd;'>Quantity</th>");
      sb.AppendLine("<th style='padding: 8px; text-align: right; border: 1px solid #ddd;'>Price</th>");
      sb.AppendLine("<th style='padding: 8px; text-align: right; border: 1px solid #ddd;'>Subtotal</th>");
      sb.AppendLine("</tr>");

      foreach (var item in order.Items)
      {
        sb.AppendLine("<tr>");
        sb.AppendLine($"<td style='padding: 8px; text-align: left; border: 1px solid #ddd;'>{item.Title ?? "Unknown Book"}</td>");
        sb.AppendLine($"<td style='padding: 8px; text-align: left; border: 1px solid #ddd;'>{item.Quantity}</td>");
        sb.AppendLine($"<td style='padding: 8px; text-align: right; border: 1px solid #ddd;'>${item.Price:F2}</td>");
        sb.AppendLine($"<td style='padding: 8px; text-align: right; border: 1px solid #ddd;'>${item.Subtotal:F2}</td>");
        sb.AppendLine("</tr>");
      }

      sb.AppendLine("</table>");

      sb.AppendLine("<div style='margin-top: 20px; text-align: right;'>");
      sb.AppendLine($"<p><strong>Subtotal:</strong> ${order.TotalAmount:F2}</p>");

      if (order.DiscountPercentage > 0)
      {
        sb.AppendLine($"<p><strong>Discount ({order.DiscountPercentage}%):</strong> -${order.DiscountAmount:F2}</p>");
      }

      sb.AppendLine($"<p style='font-size: 18px;'><strong>Total:</strong> ${order.FinalAmount:F2}</p>");
      sb.AppendLine("</div>");

      sb.AppendLine("<h2>How to Pick Up Your Order</h2>");
      sb.AppendLine("<ol>");
      sb.AppendLine("<li>Visit our store during operating hours</li>");
      sb.AppendLine("<li>Present your membership ID</li>");
      sb.AppendLine("<li>Show your claim code to the staff</li>");
      sb.AppendLine("<li>Our staff will process your order and provide your books</li>");
      sb.AppendLine("</ol>");

      sb.AppendLine("<p>If you have any questions about your order, please contact our customer service.</p>");
      sb.AppendLine("<p>Thank you for shopping with Shelf Society!</p>");

      return sb.ToString();
    }
  }
}
