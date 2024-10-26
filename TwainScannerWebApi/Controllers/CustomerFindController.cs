
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;
using System.Threading.Tasks;
using TwainScannerWebApi.Models;

namespace TwainScannerWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerFindController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=mydb;User=root;Password=0000;";


        [HttpGet, Route("customerfind")]
        public async Task<ActionResult<CustomerModel>> FindCustomer([FromQuery] string IdentityNumber)
        {
            Console.WriteLine("Identity Number is:" +IdentityNumber);
            CustomerModel foundCustomer = null;

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                string query = "SELECT first_name, last_name, email, identity_number, phone_number FROM customer WHERE identity_number = @IdentityNumber AND is_deleted = 0;";

                using (var command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@IdentityNumber", IdentityNumber);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            foundCustomer = new CustomerModel
                            {
                                FirstName = reader.GetString("first_name"),
                                LastName = reader.GetString("last_name"),
                                Email = reader.GetString("email"),
                                IdentityNumber = reader.GetString("identity_number"),
                                Phone = reader.GetString("phone_number")
                            };
                        }
                    }
                }
            }

            if (foundCustomer == null)
            {
                return NotFound(new { Message = "Customer not found." });
            }

            return Ok(foundCustomer);
        }
    }
}
