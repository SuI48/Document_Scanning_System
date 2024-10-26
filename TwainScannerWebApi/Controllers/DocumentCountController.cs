using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Security.Cryptography;
using System.Text;
using TwainScannerWebApi.Models;

namespace TwainScannerWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentCountController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=mydb;User=root;Password=0000;";

        [HttpGet, Route("documentcount")]
        public async Task<ActionResult<int>> CountDocumants()
        {

            int count = 0;

                using (var connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    string query = "SELECT COUNT(*) FROM document";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        count = Convert.ToInt32(await command.ExecuteScalarAsync());
                    }
                }

                return Ok(count);    
        }
    }

}