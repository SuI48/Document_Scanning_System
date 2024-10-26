using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Security.Cryptography;
using System.Text;
using TwainScannerWebApi.Models;

namespace TwainScannerWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentAddController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=mydb;User=root;Password=0000;";
        private readonly string root = @"C:\Users\Computer\Desktop\Document-Scanning-System\Frontend\src\";

        [HttpPost, Route("documentadd")]
        public async Task<ActionResult<bool>> DocumentAdd([FromBody] DocumentModel document)
        {
            /*
            Console.WriteLine(document.Email);
            Console.WriteLine(document.CustomerID);
            Console.WriteLine(document.DocumentName);
            Console.WriteLine(document.DocumentType);
            Console.WriteLine(document.Time);
            Console.WriteLine(document.URL);
            */
            //Converting the Timestamp to valid format
            document.Time = document.Time.Replace("T", " ").Replace("Z", "");

            string absolutePath = Path.Combine(root, document.URL.Replace('/', Path.DirectorySeparatorChar));

            if (!Directory.Exists(absolutePath))
            {
                Console.WriteLine($"Directory does not exist: {absolutePath}");
                return NotFound($"Directory not found: {absolutePath}");
            }

            var files = Directory.GetFiles(absolutePath, "*.*", SearchOption.AllDirectories);
            long totalSize = 0;

            // Sum up the size of each file
            foreach (var file in files)
            {
                FileInfo fileInfo = new FileInfo(file);
                totalSize += fileInfo.Length;
            }
            double sizeInMB = totalSize / (1024 * 1024.0); // Convert to MB
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    string query = "INSERT INTO document (user_id, customer_id, name, category_id, type, version_number, size, is_deleted, submission_time, url) VALUES ((SELECT id FROM user WHERE email = @Email AND is_deleted = 0), (SELECT id FROM customer WHERE identity_number = @CustomerID AND is_deleted = 0), @DocumentName, (SELECT id FROM category WHERE category_name = @DocumentType), @Type, 1, @Size, 0, @Time, @URL)";

                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Email", document.Email);
                        command.Parameters.AddWithValue("@CustomerID", document.CustomerID);
                        command.Parameters.AddWithValue("@DocumentName", document.DocumentName);
                        command.Parameters.AddWithValue("@DocumentType", document.DocumentType);
                        command.Parameters.AddWithValue("@Size", sizeInMB);
                        command.Parameters.AddWithValue("@Time", document.Time);
                        command.Parameters.AddWithValue("@URL", document.URL);
                        command.Parameters.AddWithValue("@Type", document.Type);



                        await command.ExecuteNonQueryAsync();
                    }
                    return Ok(true);
                }
        
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                return Ok(ex.Message);
            }
        }

    }

}