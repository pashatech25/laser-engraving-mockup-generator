export interface TextLayer {
  id: string;
  text: string;
  font: string;
  fontSize: number;
  color: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  isBold: boolean;
  isItalic: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  surfaceTone: 'light' | 'dark';
  mockupImage: string;
  engravingBoundary: {
    x: number;      // Percentage from left
    y: number;      // Percentage from top
    width: number;  // Percentage of total width
    height: number; // Percentage of total height
  };
}

export interface Job {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  product: Product;
  uploadedImage: string;
  processedImage: string;
  mockupImage: string;
  imagePosition: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
  textLayers: TextLayer[];
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ImageProcessingResult {
  originalImage: string;
  processedImage: string;
  isInverted: boolean;
}

export interface MockupState {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}
