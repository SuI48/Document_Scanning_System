using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Data;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;
using System.Runtime.Intrinsics.Arm;
using System.Diagnostics;
using TwainScannerWebApi.Models;

namespace TwainScannerWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    public class CustomerListController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=mydb;User=root;Password=0000;";

        [HttpGet, Route("customerlist")]
        public async Task<ActionResult<IEnumerable<CustomerModel>>> ShowCustomer() 
        {
            var customers = new List<CustomerModel>();
            using (var connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    string query = "SELECT id, identity_number, first_name, last_name, email, phone_number FROM customer WHERE is_deleted = 0;";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var customer = new CustomerModel
                                {
                                    Id = reader.GetInt32("id"),
                                    IdentityNumber = reader.GetString("identity_number"),
                                    FirstName = reader.GetString("first_name"),
                                    LastName = reader.GetString("last_name"),
                                    Email = reader.GetString("email"),
                                    Phone = reader.GetString("phone_number")
                                };
                                customers.Add(customer);
                            }
                        }
                    }
                }
                return Ok(customers);
        }

        [HttpPost("deleteCustomer/{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                // check if the customer exists and is not already deleted
                // COUNT(1) returns 0 or 1
                string checkQuery = "SELECT COUNT(1) FROM customer WHERE id = @Id AND is_deleted = 0";

                using (var checkCommand = new MySqlCommand(checkQuery, connection))
                {
                    checkCommand.Parameters.AddWithValue("@Id", id);
                    var count = Convert.ToInt32(await checkCommand.ExecuteScalarAsync());

                    if (count == 0)
                    {
                        // Return 404 if no matching customer is found
                        return NotFound();
                    }
                }

                // If customer exists and is not deleted, perform the delete operation
                string query = "UPDATE customer SET is_deleted = 1 WHERE id = @Id";
                using (var command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    await command.ExecuteNonQueryAsync();

                    // Return 204 No Content on successful customer deletion
                    return NoContent();
                }
            }
        }

        [HttpPost("updateCustomer/{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CustomerModel customer)
        {
            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                // Check if the customer exists and is not already deleted
                string checkQuery = "SELECT COUNT(1) FROM customer WHERE id = @Id AND is_deleted = 0";

                using (var checkCommand = new MySqlCommand(checkQuery, connection))
                {
                    checkCommand.Parameters.AddWithValue("@Id", id);
                    var count = Convert.ToInt32(await checkCommand.ExecuteScalarAsync());

                    if (count == 0)
                    {
                        // Return 404 Not Found if no matching customer is found or customer is deleted
                        return NotFound();
                    }
                }

                // If customer exists and is not deleted, perform the update operation
                string query = "UPDATE customer SET first_name = @FirstName, last_name = @LastName, email = @Email, identity_number = @IdentityNumber, phone_number = @Phone WHERE id = @Id";

                using (var command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);
                    command.Parameters.AddWithValue("@FirstName", customer.FirstName);
                    command.Parameters.AddWithValue("@LastName", customer.LastName);
                    command.Parameters.AddWithValue("@Email", customer.Email);
                    command.Parameters.AddWithValue("@IdentityNumber", customer.IdentityNumber);
                    command.Parameters.AddWithValue("@Phone", customer.Phone);
                    await command.ExecuteNonQueryAsync();

                    // Return 204 No Content on successful customer update
                    return NoContent();
                }
            }
        }
    }
}