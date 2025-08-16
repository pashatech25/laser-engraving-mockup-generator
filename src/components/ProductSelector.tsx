import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Product } from '../types';
import { Package, DollarSign, Palette } from 'lucide-react';

interface ProductSelectorProps {
  onProductSelected: (product: Product) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ onProductSelected }) => {
  const { products, setSelectedProduct } = useApp();

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    onProductSelected(product);
  };

  // Sample products if none exist
  const sampleProducts: Product[] = [
    {
      id: '1',
      name: 'Wooden Phone Stand',
      description: 'Elegant wooden phone stand with laser engraving capabilities',
      price: 29.99,
      images: ['/product1.jpg'],
      surfaceTone: 'light',
      mockupImage: '/mockup1.jpg',
      engravingBoundary: { x: 20, y: 20, width: 60, height: 60 }
    },
    {
      id: '2',
      name: 'Leather Keychain',
      description: 'Premium leather keychain perfect for personalized designs',
      price: 19.99,
      images: ['/product2.jpg'],
      surfaceTone: 'dark',
      mockupImage: '/mockup2.jpg',
      engravingBoundary: { x: 10, y: 10, width: 80, height: 80 }
    },
    {
      id: '3',
      name: 'Acrylic Coaster',
      description: 'Clear acrylic coaster with engraving area',
      price: 12.99,
      images: ['/product3.jpg'],
      surfaceTone: 'light',
      mockupImage: '/mockup3.jpg',
      engravingBoundary: { x: 15, y: 15, width: 70, height: 70 }
    }
  ];

  const displayProducts = products.length > 0 ? products : sampleProducts;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden product-card cursor-pointer"
            onClick={() => handleProductSelect(product)}
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <img
                src={product.images[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>

              {/* Product Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>${product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Palette className="h-4 w-4 mr-2" />
                  <span className="capitalize">{product.surfaceTone} Surface</span>
                </div>
              </div>

              {/* Surface Tone Indicator */}
              <div className="flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.surfaceTone === 'light'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-800 text-white'
                }`}>
                  {product.surfaceTone === 'light' ? 'Light Surface' : 'Dark Surface'}
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Available</h3>
          <p className="text-gray-500">
            Please contact an administrator to add products.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductSelector;
