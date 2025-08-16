import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, RotateCcw, Download } from 'lucide-react';
import { imageProcessor } from '../utils/imageProcessing';
import { ImageProcessingResult } from '../types';

interface ImageUploadProps {
  onImageUploaded: (image: string) => void;
  surfaceTone: 'light' | 'dark';
  onProcessedImage: (image: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUploaded, 
  surfaceTone, 
  onProcessedImage 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        onImageUploaded(result);
      };
      reader.readAsDataURL(file);

      // Process image
      const result: ImageProcessingResult = await imageProcessor.processImage(file, surfaceTone);
      setProcessedImage(result.processedImage);
      onProcessedImage(result.processedImage);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Image processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Upload Image</h3>
          
          <div
            className={`image-upload-area rounded-lg p-8 text-center transition-all ${
              dragActive ? 'dragover' : ''
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            
            {!uploadedImage ? (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, PNG, or WebP up to 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-w-full h-32 object-contain mx-auto rounded"
                />
                <p className="text-sm text-gray-600">Click to change image</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {uploadedImage && (
            <button
              onClick={resetUpload}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Processing Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Processing Results</h3>
          
          {isProcessing ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing image...</p>
              <p className="text-sm text-gray-500 mt-1">
                Converting to black & white{surfaceTone === 'dark' ? ' and inverting' : ''}
              </p>
            </div>
          ) : processedImage ? (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Processed Image</h4>
                <img
                  src={processedImage}
                  alt="Processed"
                  className="w-full h-32 object-contain rounded"
                />
                <div className="mt-2 text-xs text-gray-500">
                  <p>Surface: {surfaceTone === 'dark' ? 'Dark (Inverted)' : 'Light'}</p>
                  <p>Format: Black & White</p>
                </div>
              </div>
              
              <a
                href={processedImage}
                download="processed-image.png"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download Processed Image</span>
              </a>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Upload an image to see processing results</p>
            </div>
          )}
        </div>
      </div>

      {/* Surface Tone Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-3 h-3 rounded-full ${
              surfaceTone === 'light' ? 'bg-yellow-400' : 'bg-gray-800'
            }`}></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              {surfaceTone === 'light' ? 'Light Surface Processing' : 'Dark Surface Processing'}
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              {surfaceTone === 'light' 
                ? 'Your image will be converted to black & white for optimal engraving on light surfaces.'
                : 'Your image will be converted to black & white and inverted for optimal engraving on dark surfaces.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
