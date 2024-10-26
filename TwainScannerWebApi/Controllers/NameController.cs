using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Security.Cryptography;
using System.Text;
using TwainScannerWebApi.Models;

namespace TwainScannerWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NameController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=mydb;User=root;Password=0000;";

        [HttpGet, Route("name")]
        public async Task<ActionResult<string>> GetName(string email)
        {

            string name;

                using (var connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    string query = "SELECT first_name FROM user WHERE email = @Email";
                    using (var command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Email", email);
                    
                    var result = await command.ExecuteScalarAsync();
                    if (result != null)
                    {
                        name = Convert.ToString(result);
                        connection.Close();
                        return Ok(name);
                    }
                    else
                    {
                        connection.Close();
                        return Ok(null);
                    }
                }
                }
        }
    }

}