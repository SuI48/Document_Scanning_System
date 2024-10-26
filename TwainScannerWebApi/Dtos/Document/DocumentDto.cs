using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TwainScannerWebApi.Dtos.Document
{
 public class DocumentDto
{
    public int Id { get; set; }
    public string CustomerFullName { get; set; } = string.Empty;
    public string CustomerIdentityNumber { get; set; }
    public int CustomerId { get; set; }
    public string DocumentCategory { get; set; } = string.Empty;
    public int VersionNumber { get; set; }
    public string PersonnelFullName { get; set; } = string.Empty;
    public string SubmissionTime { get; set; } = string.Empty; // Değiştirildi
    public string Type { get; set; } = string.Empty;

}

}
