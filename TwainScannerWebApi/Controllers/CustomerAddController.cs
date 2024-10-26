
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Security.Cryptography;
using System.Text;
using TwainScannerWebApi.Models;

namespace TwainScannerWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerAddController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=mydb;User=root;Password=0000;";

        [HttpPost, Route("customeradd")]
        public async Task<ActionResult<bool>> AddCustomer([FromBody] CustomerModel customer)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    string query = "INSERT INTO customer (first_name, last_name, email, identity_number, phone_number, is_deleted) VALUES (@FirstName, @LastName, @Email, @IdentityNumber, @PhoneNumber, 0)";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@FirstName", customer.FirstName);
                        command.Parameters.AddWithValue("@LastName", customer.LastName);
                        command.Parameters.AddWithValue("@Email", customer.Email);
                        command.Parameters.AddWithValue("@IdentityNumber", customer.IdentityNumber);
                        command.Parameters.AddWithValue("@PhoneNumber", customer.Phone);

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