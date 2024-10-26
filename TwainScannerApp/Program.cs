using System;
using System.Windows.Forms;

namespace TwainScannerApp
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            string folderName = "DefaultFolder"; // Set a default folder name
            string fileType = "pdf";

            if (args.Length > 0)
            {
                folderName = args[0];
                fileType = args[1];
            }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Create an instance of the TwainScanner
            var scanner = new TwainScanner(folderName, fileType);

            // Select the scanner source
            scanner.SelectScanner();

            // Start the scanning process
            scanner.StartScanning();

            // Run the application, keeping it alive until the scanning is complete
            Application.Run(scanner);
        }
    }
}
