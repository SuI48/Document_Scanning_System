using System;
using System.Drawing; // For System.Drawing.Image
using System.Drawing.Imaging; // For ImageFormat
using System.IO; // For FileStream and MemoryStream
using System.Linq; // For LINQ methods like FirstOrDefault
using System.Windows.Forms; // For WinForms
using TwainDotNet; // For TWAIN scanning
using TwainDotNet.WinFroms; // For TWAIN Windows Forms integration
using iTextSharp.text; // For iTextSharp.text.Document
using iTextSharp.text.pdf; // For PdfWriter and iTextSharp.text.Image
using System.Collections.Generic; // For List<T>

namespace TwainScannerApp
{
    public partial class TwainScanner : Form
    {
        private Twain _twain;
        private ScanSettings _settings;
        private string _scannedFolderPath;
        private int _pageCounter = 1; // Counts the number of pages (both front and back)
        private bool _isFrontSide = true; // Tracks whether the current image is the front side
        private string _scanSessionFolderPath;
        private List<System.Drawing.Image> _scannedImages = new List<System.Drawing.Image>(); // List to store scanned images

        public TwainScanner(string folderName, string fileType)
        {
            InitializeComponent();
            try
            {
                string baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
                _scannedFolderPath = Path.GetFullPath(Path.Combine(baseDirectory, @"..\..\..\..\Frontend\src\assets"));

                _scanSessionFolderPath = Path.Combine(_scannedFolderPath, $"{folderName}");

                if (!Directory.Exists(_scanSessionFolderPath))
                {
                    Directory.CreateDirectory(_scanSessionFolderPath);
                }

                // Initialize TWAIN with an invisible form
                _twain = new Twain(new WinFormsWindowMessageHook(this));
                _twain.TransferImage += (s, e) =>
                {
                    SaveImage(e.Image, fileType);
                };
                _twain.ScanningComplete += (s, e) =>
                {
                    if(fileType == "pdf"){
                        FinalizePdf();
                    }
                    Console.WriteLine("Scanning complete.");
                    Application.Exit();  // Close the application
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing TWAIN: {ex.Message}");
            }
        }

        private void SaveImage(System.Drawing.Image image, string fileType)
        {
            // Determine the side (front or back) and generate the filename
            string side = _isFrontSide ? "front" : "back";
            string fileName = $"image_{_pageCounter}_{side}.{fileType}";
            string filePath = Path.Combine(_scanSessionFolderPath, fileName);

            if (fileType.ToLower() == "pdf")
            {
                // Add the image to the list of scanned images
                _scannedImages.Add((System.Drawing.Image)image.Clone());
            }
            else
            {
                // For non-PDF file types, save the image as usual
                image.Save(filePath, ImageFormat.Png);
                Console.WriteLine($"Image saved as {fileName}.");
            }

            // If we just saved the back side, increment the page counter
            if (!_isFrontSide)
            {
                _pageCounter++;
            }

            // Toggle the side for the next image
            _isFrontSide = !_isFrontSide;
        }

        private void FinalizePdf()
        {
            string pdfFileName = "image.pdf";
            string pdfFilePath = Path.Combine(_scanSessionFolderPath, pdfFileName);

            using (FileStream fs = new FileStream(pdfFilePath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                using (iTextSharp.text.Document doc = new iTextSharp.text.Document())
                {
                    PdfWriter writer = PdfWriter.GetInstance(doc, fs);
                    doc.Open();

                    foreach (var img in _scannedImages)
                    {
                        // Convert System.Drawing.Image to iTextSharp.text.Image
                        using (MemoryStream ms = new MemoryStream())
                        {
                            img.Save(ms, ImageFormat.Jpeg);
                            iTextSharp.text.Image pdfImage = iTextSharp.text.Image.GetInstance(ms.ToArray());

                            // Fit image to page size
                            pdfImage.ScaleToFit(doc.PageSize.Width - doc.LeftMargin - doc.RightMargin,
                                                doc.PageSize.Height - doc.TopMargin - doc.BottomMargin);

                            pdfImage.Alignment = iTextSharp.text.Element.ALIGN_CENTER;

                            // Add image to document
                            doc.Add(pdfImage);
                        }
                    }

                    doc.Close();
                    Console.WriteLine($"PDF file created at {pdfFilePath}");
                }
            }

            // Clean up the images after creating the PDF
            foreach (var img in _scannedImages)
            {
                img.Dispose();
            }
            _scannedImages.Clear();
        }

        public void SelectScanner()
        {
            try
            {
                var scannerSource = _twain.SourceNames.FirstOrDefault(s => s.Contains("Canon DR-C230 TWAIN"));
                if (scannerSource != null)
                {
                    _twain.SelectSource(scannerSource);
                }
                else
                {
                    Console.WriteLine("Desired scanner not found. Please ensure the scanner is connected.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error selecting scanner source: {ex.Message}");
            }
        }

        public void StartScanning()
        {
            try
            {
                _settings = new ScanSettings
                {
                    UseDocumentFeeder = true,
                    ShowTwainUI = false,  // No UI
                    ShowProgressIndicatorUI = false,  // No UI
                    UseDuplex = true,  // Enable duplex scanning
                    Resolution = ResolutionSettings.Fax,
                    Area = null,
                    ShouldTransferAllPages = true,
                };

                _twain.StartScanning(_settings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error starting scan: {ex.Message}");
            }
        }

        // Run this in a hidden mode
        protected override void SetVisibleCore(bool value)
        {
            base.SetVisibleCore(false);
        }
    }
}
