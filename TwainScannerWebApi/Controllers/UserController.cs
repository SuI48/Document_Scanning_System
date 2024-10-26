using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using TwainScannerWebApi.Dtos.User;
using TwainScannerWebApi.Models;

namespace TwainScannerWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public UserController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("updateUser")]
        public async Task<ActionResult<bool>> UpdateUser([FromBody] UserModel user, [FromHeader] string currentUserEmail)
        {
            string connectionString = _configuration.GetConnectionString("DefaultConnection");

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                // Declare variables to store current user information
                int currentUserId = -1;
                string currentUserRole = string.Empty;

                // Fetch current user's ID and role name based on email
                string currentUserQuery = @"
                    SELECT u.id, r.role_name
                    FROM user u
                    INNER JOIN role r ON u.role_id = r.id
                    WHERE u.email = @currentUserEmail";
                
                using (var currentUserCommand = new MySqlCommand(currentUserQuery, connection))
                {
                    currentUserCommand.Parameters.AddWithValue("@currentUserEmail", currentUserEmail);
                    using (var reader = await currentUserCommand.ExecuteReaderAsync())
                    {
                        if (!reader.HasRows)
                        {
                            return StatusCode(404, "Current user not found");
                        }

                        await reader.ReadAsync();
                        currentUserId = reader.GetInt32("id");
                        currentUserRole = reader.GetString("role_name");
                    }
                }

                // Map frontend role names to database role names
                var roleMapping = new Dictionary<string, string>
                {
                    { "Yönetici", "manager" },
                    { "Admin", "admin" },
                    { "Personel", "personnel" }
                };

                if (!roleMapping.TryGetValue(user.Role, out var roleInDatabase))
                {
                    return StatusCode(400, "Role not found");
                }

                // Fetch the role ID for the role of the user being updated
                string getRoleIdQuery = @"
                    SELECT id
                    FROM role
                    WHERE role_name = @Role";
                
                int? roleId = null;
                using (var getRoleIdCommand = new MySqlCommand(getRoleIdQuery, connection))
                {
                    getRoleIdCommand.Parameters.AddWithValue("@Role", roleInDatabase);
                    var roleIdResult = await getRoleIdCommand.ExecuteScalarAsync();

                    if (roleIdResult != null)
                    {
                        roleId = Convert.ToInt32(roleIdResult);
                    }
                    else
                    {
                        return StatusCode(400, "Role not found");
                    }
                }

                // Fetch the current email and role of the user being updated
                string userRoleQuery = @"
                    SELECT u.email, r.role_name
                    FROM user u
                    INNER JOIN role r ON u.role_id = r.id
                    WHERE u.id = @UserId";
                
                string targetUserEmail;
                string targetUserRole;
                using (var userRoleCommand = new MySqlCommand(userRoleQuery, connection))
                {
                    userRoleCommand.Parameters.AddWithValue("@UserId", user.Id);
                    using (var reader = await userRoleCommand.ExecuteReaderAsync())
                    {
                        if (!reader.HasRows)
                        {
                            return StatusCode(404, "Target user not found");
                        }

                        await reader.ReadAsync();
                        targetUserEmail = reader.GetString("email");
                        targetUserRole = reader.GetString("role_name");
                    }
                }

                // Check if the user is attempting to change their own email
                if (currentUserId == user.Id && currentUserEmail != user.Email)
                {
                    return StatusCode(403, "You cannot change your own email.");
                }

                // Check permissions
                if (currentUserId == user.Id && currentUserRole != roleInDatabase)
                {
                    return StatusCode(403, "You cannot change your own role.");
                }

                if (currentUserRole == "admin")
                {
                    // Admin can update anyone
                }
                // else if (currentUserRole == "manager")
                // {
                //     if (targetUserRole != "personnel")
                //     {
                //         // Prevent updating non-personnel roles or deleting them
                //         return StatusCode(403, "You do not have permission to perform this action.");
                //     }
                //     if (roleInDatabase != "personnel")
                //     {
                //         // Manager can't change role to something other than Personnel
                //         return StatusCode(403, "You do not have permission to perform this action.");
                //     }
                // }
                else if (currentUserRole == "manager")
                {
                    return StatusCode(403, "You do not have permission to perform this action.");
                }
                else if (currentUserRole == "personnel")
                {
                    return StatusCode(403, "You do not have permission to perform this action.");
                }

                // Update user information
                string updateQuery = @"
                    UPDATE user
                    SET first_name = @FirstName, 
                        last_name = @LastName, 
                        email = @Email, 
                        phone_number = @Phone, 
                        role_id = @RoleId
                    WHERE id = @UserId";
                
                using (var updateCommand = new MySqlCommand(updateQuery, connection))
                {
                    updateCommand.Parameters.AddWithValue("@FirstName", user.FirstName);
                    updateCommand.Parameters.AddWithValue("@LastName", user.LastName);
                    updateCommand.Parameters.AddWithValue("@Email", user.Email);
                    updateCommand.Parameters.AddWithValue("@Phone", user.Phone);
                    updateCommand.Parameters.AddWithValue("@RoleId", roleId);
                    updateCommand.Parameters.AddWithValue("@UserId", user.Id);

                    await updateCommand.ExecuteNonQueryAsync();
                }
            }
            return Ok(true);
        }

        [HttpPost("deleteUser/{userId}")]
        public async Task<ActionResult<bool>> DeleteUser(int userId, [FromHeader] string currentUserEmail)
        {
            string connectionString = _configuration.GetConnectionString("DefaultConnection");

            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();

                // Fetch current user's role_id, id, and is_deleted status
                string currentUserQuery = "SELECT role_id, id, is_deleted FROM user WHERE email = @currentUserEmail";
                using (var currentUserCommand = new MySqlCommand(currentUserQuery, connection))
                {
                    currentUserCommand.Parameters.AddWithValue("@currentUserEmail", currentUserEmail);
                    using (var reader = await currentUserCommand.ExecuteReaderAsync())
                    {
                        if (!reader.HasRows)
                        {
                            return StatusCode(404, "Current user not found");
                        }

                        await reader.ReadAsync();
                        var currentUserRole = reader.GetInt32("role_id");
                        var currentUserId = reader.GetInt32("id");
                        var isDeleted = reader.GetBoolean("is_deleted");

                        // Check if the current user is marked as deleted
                        if (isDeleted)
                        {
                            return StatusCode(403, "Deleted users cannot perform actions.");
                        }

                        reader.Close(); // Close the reader before executing another command

                        // Fetch the role of the user being deleted
                        string userRoleQuery = "SELECT role_id FROM user WHERE id = @UserId";
                        using (var userRoleCommand = new MySqlCommand(userRoleQuery, connection))
                        {
                            userRoleCommand.Parameters.AddWithValue("@UserId", userId);
                            var targetUserRole = (int?)await userRoleCommand.ExecuteScalarAsync();

                            if (targetUserRole == null)
                            {
                                return StatusCode(404, "Target user not found");
                            }

                            if (currentUserId == userId)
                            {
                                return StatusCode(403, "You can't delete yourself."); // Prevent self-deletion
                            }

                            // if (currentUserRole == 2 && targetUserRole != 3) // Manager trying to delete non-personnel
                            // {
                            //     return StatusCode(403, "You do not have permission to perform this action.");
                            // }

                            if (currentUserRole == 2) // Manager
                            {
                                return StatusCode(403, "You do not have permission to perform this action.");
                            }

                            else if (currentUserRole == 3) // Personnel
                            {
                                return StatusCode(403, "You do not have permission to perform this action.");
                            }

                            // Mark the user as deleted
                            string deleteQuery = "UPDATE user SET is_deleted = 1 WHERE id = @UserId";
                            using (var deleteCommand = new MySqlCommand(deleteQuery, connection))
                            {
                                deleteCommand.Parameters.AddWithValue("@UserId", userId);
                                await deleteCommand.ExecuteNonQueryAsync();
                            }
                        }
                    }
                }
            }
            return Ok(true);
        }
    }
}