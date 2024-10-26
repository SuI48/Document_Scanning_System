using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Security.Cryptography;
using System.Text;
using TwainScannerWebApi.Models;

namespace TwainScannerWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
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
        private readonly string connectionString = "Server=localhost;Database=mydb;User=root;Password=0000;";

        [HttpPost, Route("login")]
        public async Task<ActionResult<string>> Login([FromBody] UserModel model)
        {
            string userType = string.Empty;

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                string query = "SELECT role_name FROM role where id = (SELECT role_id FROM user WHERE email = @Email AND password = @Password AND is_deleted = 0)";
                using (var command = new MySqlCommand(query, connection))
                {
                    Console.WriteLine(model.Email);
                    Console.WriteLine(model.Password);
                    model.Password = ComputeSha256Hash(model.Password);
                    command.Parameters.AddWithValue("@Email", model.Email);
                    command.Parameters.AddWithValue("@Password", model.Password);
                    
                    var result = await command.ExecuteScalarAsync();
                    if (result != null)
                    {
                        userType = Convert.ToString(result);
                        Console.WriteLine(userType);
                        connection.Close();
                        return Ok(userType);
                    }
                    else
                    {
                        Console.WriteLine("null value");
                        connection.Close();
                        return Ok(null);
                    }
                }
            }        
        }
    }
}
