import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css'],
  standalone: true,
  imports: [MatIconModule, MatButtonModule, CommonModule ]
})
export class DocumentViewerComponent {
  currentIndex = 1;
  zoomLevel = 1;
  /*
  images: string[] = [
    'https://i.namu.wiki/i/bbGl5GuNm71V4iJ8ACke8zEIk5_jqa1DA5eKAaeB-PoYGJs0U3bgUvylIFUDpf5PTFOM3mhp5ngykPrZzFuDy_XGSJvvGuP_y9NvJsdohbKWw8THZIixIrC6r5KbqCoSDgtk32ws0khYu29LKTtZrg.webp',
    'https://i.namu.wiki/i/k1GuvqaNgMEbfEebjFDmFP_6TnbVG3mE1Bu7pqhaN9gcL5uoQLMe2WYlyrl35pTpakq1FokAlXxtKTD55xt0qzyUporpeSG5yjVi1k-gClJT40BS2voomr1zAQSHQu5QrhxqomD-vLb_7UIxQYth4w.webp',
    'https://statusneo.com/wp-content/uploads/2023/02/MicrosoftTeams-image551ad57e01403f080a9df51975ac40b6efba82553c323a742b42b1c71c1e45f1.jpg',
    'assets/document/12345678901/image_1_front.png'
  ];
  */
  images: string[] = [];
  folderUrl: string = '';
  imagePrefix: string = 'image_'; // Common prefix for image files
  imageSuffixes: string[] = ['_front.', '_back.']; // Suffixes for front and back images
  imageExtension: string = 'png'; // File extension for images

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string, url: string, format: string },
    private dialogRef: MatDialogRef<DocumentViewerComponent>,
  ) {}

  dragStartX = 0;
  dragStartY = 0;
  dragging = false;
  currentX = 0;
  currentY = 0;
  translateX = 0;
  translateY = 0;

  ngOnInit(): void {
    // Use the URL passed from DocumentListComponent
    this.imageExtension = this.data.format;
    const url = `${this.data.url}/image.pdf`;
    if(this.data.format === 'pdf'){
       window.open(url, '_blank');
       this.close()
    }
    else{
      this.folderUrl = this.data.url;
      this.loadImages();
      this.setupImageDragging();
    }
    
  }

  // Dynamically load images until the end of the folder
  loadImages(): void {
    this.loadNextImage();
  }

  loadNextImage(): void {
    let foundAnyImage = false; // Flag to check if at least one image is found for the current index

    // Loop through each suffix (front and back) for the current index
    for (const suffix of this.imageSuffixes) {
      const imagePath = `${this.folderUrl}/${this.imagePrefix}${this.currentIndex}${suffix}${this.imageExtension}`;
      
      this.checkImageExists(imagePath).then(exists => {
        if (exists) {
          this.images.push(imagePath); // Add image to array if it exists
          foundAnyImage = true;
        }

        // Check if we are done checking all suffixes for the current index
        if (suffix === this.imageSuffixes[this.imageSuffixes.length - 1]) {
          if (foundAnyImage) {
            this.currentIndex++;
            this.loadNextImage(); // Load the next set of images recursively
          }
        }
      });
    }
  }

  // Check if an image exists at the given URL
  checkImageExists(url: string): Promise<boolean> {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }
  setupImageDragging(): void {
    const image = document.querySelector('.full-image') as HTMLElement;

    if (image) {
      image.addEventListener('mousedown', this.onMouseDown.bind(this));
      image.addEventListener('mousemove', this.onMouseMove.bind(this));
      image.addEventListener('mouseup', this.onMouseUp.bind(this));
      image.addEventListener('mouseleave', this.onMouseUp.bind(this));
    }

    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }
  /*

  ngOnInit(): void {
    const image = document.querySelector('.full-image') as HTMLElement;

    image.addEventListener('mousedown', this.onMouseDown.bind(this));
    image.addEventListener('mousemove', this.onMouseMove.bind(this));
    image.addEventListener('mouseup', this.onMouseUp.bind(this));
    image.addEventListener('mouseleave', this.onMouseUp.bind(this));

    // Klavye olaylarını dinlemek için
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }
*/
  onMouseDown(event: MouseEvent): void {
    this.dragging = true;
    this.dragStartX = event.clientX - this.translateX;
    this.dragStartY = event.clientY - this.translateY;

    const image = event.target as HTMLElement;
    image.classList.add('dragging');
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.dragging) return;

    this.translateX = event.clientX - this.dragStartX;
    this.translateY = event.clientY - this.dragStartY;

    const image = event.target as HTMLElement;
    image.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.zoomLevel})`;
  }

  onMouseUp(event: MouseEvent): void {
    this.dragging = false;

    const image = event.target as HTMLElement;
    image.classList.remove('dragging');
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'ArrowLeft') {
      this.previousImage();
    }
  }

  nextImage(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.resetImagePosition();
    }
  }

  previousImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetImagePosition();
    }
  }

  resetImagePosition(): void {
    this.translateX = 0;
    this.translateY = 0;
    const image = document.querySelector('.full-image') as HTMLElement;
    if (image) {
      image.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.zoomLevel})`;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 3);  // Maksimum büyütme seviyesi (örn. 3x)
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.5); // Minimum küçültme seviyesi (örn. 0.5x)
  }

  downloadImage(): void {
    const link = document.createElement('a');
    link.href = this.images[this.currentIndex];
    link.download = 'image.pdf';
    link.click();
  }

  selectImage(index: number): void {
    this.currentIndex = index;
  }
}
