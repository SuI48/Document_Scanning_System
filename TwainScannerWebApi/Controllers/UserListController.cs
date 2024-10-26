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
    
    public class UserListController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=mydb;User=root;Password=0000;";

        [HttpGet, Route("userlist")]
        public async Task<ActionResult<IEnumerable<UserModel>>> ShowUser() 
        {
            var users = new List<UserModel>();
            using (var connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    string query = "SELECT u.id, u.first_name, u.last_name, r.role_name, u.email, u.phone_number FROM user u JOIN role r ON u.role_id = r.id WHERE is_deleted = 0;";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                var user = new UserModel
                                {
                                    Id = reader.GetInt32("id"),
                                    FirstName = reader.GetString("first_name"),
                                    LastName = reader.GetString("last_name"),
                                    Role = reader.GetString("role_name"),
                                    Email = reader.GetString("email"),
                                    Phone = reader.GetString("phone_number")
                                };
                                users.Add(user);
                            }
                        }
                    }
                }
                return Ok(users);
        }
    }
    
}