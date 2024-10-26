using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using TwainScannerWebApi.Models;
using TwainScannerWebApi.Dtos.Document;

namespace TwainScannerWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentController : ControllerBase
    {
        private readonly string connectionString = "Server=localhost;Database=mydb;User=root;Password=0000;";

        [HttpGet("filter")]
        public async Task<IActionResult> GetFilteredDocuments(string customerIdentity = "", string documentCategory = "", string personnelName = "")
        {
            var query = @"
                    SELECT  
                    d.id AS Id,
                    CONCAT(c.first_name, ' ', c.last_name) AS CustomerFullName,
                    c.identity_number AS CustomerIdentityNumber,  -- Yeni alan
                    c.id AS CustomerId,
                    cat.category_name AS DocumentCategory,
                    d.version_number AS VersionNumber,
                    CONCAT(u.first_name, ' ', u.last_name) AS PersonnelFullName,
                    DATE_FORMAT(d.submission_time, '%d/%m/%Y %H:%i') AS SubmissionTime,
                    d.type AS Type
                FROM 
                    document d
                INNER JOIN 
                    customer c ON d.customer_id = c.id
                INNER JOIN 
                    user u ON d.user_id = u.id
                INNER JOIN 
                    category cat ON d.category_id = cat.id
                WHERE 
                    (@CustomerIdentity = '' OR c.identity_number = @CustomerIdentity)  -- Exact match condition
                AND 
                    (@DocumentCategory = '' OR cat.category_name LIKE CONCAT('%', @DocumentCategory, '%'))
                AND 
                    (@PersonnelName = '' OR CONCAT(u.first_name, ' ', u.last_name) LIKE CONCAT('%', @PersonnelName, '%'))
                AND 
                    d.is_deleted = 0;
            ";

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                using (var command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@CustomerIdentity", customerIdentity);
                    command.Parameters.AddWithValue("@DocumentCategory", documentCategory);
                    command.Parameters.AddWithValue("@PersonnelName", personnelName);

                    var reader = await command.ExecuteReaderAsync();
                    var results = new List<DocumentDto>();

                    while (await reader.ReadAsync())
                    {
                        var documentDto = new DocumentDto
                        {
                            Id = reader.GetInt32("Id"),
                            CustomerFullName = reader.GetString("CustomerFullName"),
                            CustomerIdentityNumber = reader.GetString("CustomerIdentityNumber"), // Yeni alan
                            CustomerId = reader.GetInt32("CustomerId"),
                            DocumentCategory = reader.GetString("DocumentCategory"),
                            VersionNumber = reader.GetInt32("VersionNumber"),
                            PersonnelFullName = reader.GetString("PersonnelFullName"),
                            SubmissionTime = reader.GetString("SubmissionTime"),
                            Type = reader.GetString("Type"),

                        };

                        results.Add(documentDto);
                    }

                    return Ok(results);
                }
            }
        }

        [HttpGet("view/{id}")]
        public async Task<IActionResult> ViewDocument(int id)
        {
            var query = "SELECT url FROM document WHERE id = @Id AND is_deleted = 0";

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                using (var command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@Id", id);

                    var result = await command.ExecuteScalarAsync();

                    if (result != null)
                    {
                        return Ok(result.ToString());
                    }
                    else
                    {
                        return NotFound("Document not found or has been deleted.");
                    }
                }
            }
        }

        [HttpGet("documentcount")]
        public async Task<IActionResult> GetDocumentCount()
        {
            var query = "SELECT COUNT(*) FROM document WHERE is_deleted = 0";

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                using (var command = new MySqlCommand(query, connection))
                {
                    var count = (long)await command.ExecuteScalarAsync();
                    return Ok(count);
                }
            }
        }

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentDocuments()
        {
            var query = @"
                SELECT  
                    d.id AS Id,
                    CONCAT(c.first_name, ' ', c.last_name) AS CustomerFullName,
                    cat.category_name AS DocumentCategory,
                    d.version_number AS VersionNumber,
                    CONCAT(u.first_name, ' ', u.last_name) AS PersonnelFullName,
                    DATE_FORMAT(d.submission_time, '%d/%m/%Y %H:%i') AS SubmissionTime
                FROM 
                    document d
                INNER JOIN 
                    customer c ON d.customer_id = c.id
                INNER JOIN 
                    user u ON d.user_id = u.id
                INNER JOIN 
                    category cat ON d.category_id = cat.id
                WHERE 
                    d.is_deleted = 0
                ORDER BY 
                    d.submission_time DESC
                LIMIT 5";

            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    using (var command = new MySqlCommand(query, connection))
                    {
                        var reader = await command.ExecuteReaderAsync();
                        var results = new List<DocumentDto>();

                        while (await reader.ReadAsync())
                        {
                            var documentDto = new DocumentDto
                            {
                                Id = reader.GetInt32("Id"),
                                CustomerFullName = reader.GetString("CustomerFullName"),
                                DocumentCategory = reader.GetString("DocumentCategory"),
                                VersionNumber = reader.GetInt32("VersionNumber"),
                                PersonnelFullName = reader.GetString("PersonnelFullName"),
                                SubmissionTime = reader.GetString("SubmissionTime")
                            };

                            results.Add(documentDto);
                        }

                        return Ok(results);
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}




/*
SELECT  
                    d.id AS Id,
                    CONCAT(c.first_name, ' ', c.last_name) AS CustomerFullName,
                    c.identity_number AS CustomerIdentityNumber,  -- Yeni alan
                    cat.category_name AS DocumentCategory,
                    d.version_number AS VersionNumber,
                    CONCAT(u.first_name, ' ', u.last_name) AS PersonnelFullName,
                    DATE_FORMAT(d.submission_time, '%d/%m/%Y') AS SubmissionTime
                FROM 
                    document d
                INNER JOIN 
                    customer c ON d.customer_id = c.id
                INNER JOIN 
                    user u ON d.user_id = u.id
                INNER JOIN 
                    category cat ON d.category_id = cat.id
                WHERE 
                    (@CustomerName = '' OR CONCAT(c.first_name, ' ', c.last_name) LIKE CONCAT('%', @CustomerName, '%'))
                AND 
                    (@DocumentCategory = '' OR cat.category_name LIKE CONCAT('%', @DocumentCategory, '%'))
                AND 
                    (@PersonnelName = '' OR CONCAT(u.first_name, ' ', u.last_name) LIKE CONCAT('%', @PersonnelName, '%'))
                AND 
                    d.is_deleted = 0
*/