using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Security.Cryptography;
using System.Text;
using TwainScannerWebApi.Models;

namespace TwainScannerWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserAddController : ControllerBase
    {

        public static string ComputeSha256Hash(string rawData)
        {
           // Create a SHA256
            using (SHA256 sha256Hash = SHA256.Create())
            {
               // ComputeHash - returns byte array
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));

                // Convert byte array to a string
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }
        private readonly string connectionString = "Server=localhost;Database=mydb;User=root;Password=0000;";

        [HttpPost, Route("useradd")]
        public async Task<ActionResult<bool>> AddUser([FromBody] UserModel user)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    string query = "INSERT INTO user (first_name, last_name, role_id, email, password, phone_number, is_deleted) VALUES (@FirstName, @LastName, (SELECT id FROM role WHERE role_name = @Role), @Email, @Password, @PhoneNumber, 0)";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        user.Password = ComputeSha256Hash(user.Password);
                        command.Parameters.AddWithValue("@FirstName", user.FirstName);
                        command.Parameters.AddWithValue("@LastName", user.LastName);
                        command.Parameters.AddWithValue("@Role", user.Role);
                        command.Parameters.AddWithValue("@Email", user.Email);
                        command.Parameters.AddWithValue("@Password", user.Password);
                        command.Parameters.AddWithValue("@PhoneNumber", user.Phone);


                        await command.ExecuteNonQueryAsync();
                    }
                    return Ok(true);
                }
        
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                return Ok(false);
            }
        }

    }

}