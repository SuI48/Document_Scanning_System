using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Threading.Tasks;

namespace TwainScannerWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScannerController : ControllerBase
    {
        [HttpGet, Route("scan")]
        public async Task<IActionResult> ScanDocument([FromQuery] string folderName, string fileType)
        {
            // Combine arguments into a single string separated by spaces
            string arguments = $"{folderName} {fileType}";
            Console.WriteLine("In BackEnd: Starting the scan process...");
            try
            {
                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = "C:\\Users\\Computer\\Desktop\\Document-Scanning-System\\TwainScannerApp\\bin\\Debug\\net48\\TwainScannerApp.exe",
                    Arguments = arguments, // Pass the folder name as an argument
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (Process process = Process.Start(startInfo))
                {
                    await Task.Run(() => process.WaitForExit()); // Await the process exit asynchronously
                    string output = await process.StandardOutput.ReadToEndAsync(); // Read output asynchronously
                    Console.WriteLine("Process finished with output: " + output);
                }

                return Ok(new { success = true, message = "Scanning complete" });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
