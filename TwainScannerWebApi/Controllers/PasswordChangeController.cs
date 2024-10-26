using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using TwainScannerWebApi.Models;
using System.ComponentModel.DataAnnotations;

namespace TwainScannerWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=mydb;User=root;Password=0000;";
        private readonly ILogger<AccountController> _logger;

        public AccountController(ILogger<AccountController> logger)
        {
            _logger = logger;
        }

        
        public static string ComputeSha256Hash(string rawData)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }

        [HttpPost, Route("changepassword")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        {
            
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Model validation failed: {@ModelState}", ModelState);
                return BadRequest(ModelState);  
            }

            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    _logger.LogInformation("Database connection opened successfully.");

                    
                    string selectQuery = "SELECT COUNT(*) FROM user WHERE email = @Email AND password = @OldPassword AND is_deleted = 0";
                    using (var command = new MySqlCommand(selectQuery, connection))
                    {
                        command.Parameters.AddWithValue("@Email", model.Email);
                        command.Parameters.AddWithValue("@OldPassword", ComputeSha256Hash(model.OldPassword));

                        var result = await command.ExecuteScalarAsync();
                        if (Convert.ToInt32(result) > 0)
                        {
                            _logger.LogInformation("Old password validated successfully.");

                            
                            string updateQuery = "UPDATE user SET password = @NewPassword WHERE email = @Email AND is_deleted = 0";
                            using (var updateCommand = new MySqlCommand(updateQuery, connection))
                            {
                                updateCommand.Parameters.AddWithValue("@NewPassword", ComputeSha256Hash(model.NewPassword));
                                updateCommand.Parameters.AddWithValue("@Email", model.Email);

                                var updateResult = await updateCommand.ExecuteNonQueryAsync();

                                if (updateResult > 0)
                                {
                                    _logger.LogInformation("Password updated successfully.");
                                    return Ok("Password changed successfully");
                                }
                                else
                                {
                                    _logger.LogWarning("Failed to update the password. No rows affected.");
                                    return BadRequest("Failed to change the password");
                                }
                            }
                        }
                        else
                        {
                            _logger.LogWarning("Invalid old password.");
                            return BadRequest("Invalid old password");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while changing the password.");
                return StatusCode(500, "An internal server error occurred");
            }
        }
    }
}


namespace TwainScannerWebApi.Models
{
    public class ChangePasswordModel
    {
        [Required(ErrorMessage = "Email is required")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Old password is required")]
        public string OldPassword { get; set; }

        [Required(ErrorMessage = "New password is required")]
        public string NewPassword { get; set; }

        [Required(ErrorMessage = "Confirm new password is required")]
        public string ConfirmNewPassword { get; set; }
    }
}


