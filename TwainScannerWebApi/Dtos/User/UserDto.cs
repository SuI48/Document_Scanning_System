using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TwainScannerWebApi.Dtos.User
{
    public class UserDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
