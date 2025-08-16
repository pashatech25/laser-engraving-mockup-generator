import { ImageProcessingResult } from '../types';

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async processImage(
    imageFile: File,
    surfaceTone: 'light' | 'dark'
  ): Promise<ImageProcessingResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const result = this.processImageData(img, surfaceTone);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  }

  private processImageData(
    img: HTMLImageElement,
    surfaceTone: 'light' | 'dark'
  ): ImageProcessingResult {
    // Set canvas dimensions
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    // Draw original image
    this.ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    // Convert to black & white
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert to grayscale using luminance formula
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      
      // Apply black & white conversion (threshold at 128)
      const bw = gray > 128 ? 255 : 0;
      
      data[i] = bw;     // Red
      data[i + 1] = bw; // Green
      data[i + 2] = bw; // Blue
      // Alpha channel remains unchanged
    }

    // If dark surface, invert the image
    if (surfaceTone === 'dark') {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];     // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
      }
    }

    // Put processed image data back to canvas
    this.ctx.putImageData(imageData, 0, 0);

    // Convert to data URL
    const processedImage = this.canvas.toDataURL('image/png');

    return {
      originalImage: img.src,
      processedImage,
      isInverted: surfaceTone === 'dark'
    };
  }

  async createMockup(
    productImage: string,
    processedImage: string,
    position: { x: number; y: number },
    scale: number,
    rotation: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const productImg = new Image();
      const processedImg = new Image();
      
      let loadedImages = 0;
      
      const checkAllLoaded = () => {
        loadedImages++;
        if (loadedImages === 2) {
          try {
            const mockup = this.compositeImages(productImg, processedImg, position, scale, rotation);
            resolve(mockup);
          } catch (error) {
            reject(error);
          }
        }
      };

      productImg.onload = checkAllLoaded;
      processedImg.onload = checkAllLoaded;
      
      productImg.onerror = reject;
      processedImg.onerror = reject;
      
      productImg.src = productImage;
      processedImg.src = processedImage;
    });
  }

  private compositeImages(
    productImg: HTMLImageElement,
    processedImg: HTMLImageElement,
    position: { x: number; y: number },
    scale: number,
    rotation: number
  ): string {
    // Set canvas to product image dimensions
    this.canvas.width = productImg.width;
    this.canvas.height = productImg.height;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw product image as background
    this.ctx.drawImage(productImg, 0, 0);

    // Save context for transformations
    this.ctx.save();

    // Move to center of processed image
    const centerX = position.x + (processedImg.width * scale) / 2;
    const centerY = position.y + (processedImg.height * scale) / 2;

    // Apply transformations
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(rotation * Math.PI / 180);
    this.ctx.scale(scale, scale);

    // Draw processed image centered
    this.ctx.drawImage(
      processedImg,
      -processedImg.width / 2,
      -processedImg.height / 2
    );

    // Restore context
    this.ctx.restore();

    return this.canvas.toDataURL('image/png');
  }
}

export const imageProcessor = new ImageProcessor();
