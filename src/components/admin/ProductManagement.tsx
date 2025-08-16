import React, { useState, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Product } from '../../types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Card, CardContent } from '../ui/card';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  surfaceTone: 'light' | 'dark';
  images: File[];
  mockupImage: File | null;
  engravingBoundary: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const ProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    surfaceTone: 'light',
    images: [],
    mockupImage: null,
    engravingBoundary: { x: 0, y: 0, width: 100, height: 100 }
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingMockup, setExistingMockup] = useState<string>('');
  const [boundarySelection, setBoundarySelection] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    isSelecting: boolean;
  }>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isSelecting: false
  });
  const [mockupPreview, setMockupPreview] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, field: 'images' | 'mockupImage') => {
    const files = event.target.files;
    if (!files) return;

    if (field === 'images') {
      setFormData(prev => ({ ...prev, images: Array.from(files) }));
    } else {
      const file = files[0];
      setFormData(prev => ({ ...prev, mockupImage: file }));
      
      // Create preview for boundary selection
      const reader = new FileReader();
      reader.onload = (e) => {
        setMockupPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBoundaryMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setBoundarySelection(prev => ({
      ...prev,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      isSelecting: true
    }));
  };

  const handleBoundaryMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!boundarySelection.isSelecting) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setBoundarySelection(prev => ({
      ...prev,
      endX: x,
      endY: y
    }));
  };

  const handleBoundaryMouseUp = () => {
    if (!boundarySelection.isSelecting) return;

    const { startX, startY, endX, endY } = boundarySelection;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    setFormData(prev => ({
      ...prev,
      engravingBoundary: { x, y, width, height }
    }));

    setBoundarySelection(prev => ({ ...prev, isSelecting: false }));
  };

  const drawBoundary = () => {
    const canvas = canvasRef.current;
    if (!canvas || !mockupPreview) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw mockup image
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Draw current boundary
      const { x, y, width, height } = formData.engravingBoundary;
      const pixelX = (x / 100) * canvas.width;
      const pixelY = (y / 100) * canvas.height;
      const pixelWidth = (width / 100) * canvas.width;
      const pixelHeight = (height / 100) * canvas.height;

      // Draw boundary rectangle
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(pixelX, pixelY, pixelWidth, pixelHeight);
      ctx.setLineDash([]);

      // Draw selection if active
      if (boundarySelection.isSelecting) {
        const startX = (boundarySelection.startX / 100) * canvas.width;
        const startY = (boundarySelection.startY / 100) * canvas.height;
        const endX = (boundarySelection.endX / 100) * canvas.width;
        const endY = (boundarySelection.endY / 100) * canvas.height;

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(
          Math.min(startX, endX),
          Math.min(startY, endY),
          Math.abs(endX - startX),
          Math.abs(endY - startY)
        );
        ctx.setLineDash([]);
      }
    };
    img.src = mockupPreview;
  };

  React.useEffect(() => {
    drawBoundary();
  }, [mockupPreview, formData.engravingBoundary, boundarySelection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For new products, mockup is required
    if (!editingProduct && !formData.mockupImage) {
      alert('Please upload a mockup image');
      return;
    }

    // For editing, use existing mockup if no new one is uploaded
    if (editingProduct && !formData.mockupImage && !existingMockup) {
      alert('Please upload a mockup image');
      return;
    }

    // Handle images - use existing ones if no new ones uploaded during edit
    let imageUrls: string[] = [];
    let mockupUrl: string = '';

    if (editingProduct) {
      // Editing mode - use existing images/mockup if no new ones uploaded
      imageUrls = formData.images.length > 0 
        ? await Promise.all(formData.images.map(file => {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(file);
            });
          }))
        : existingImages; // Use existing images if no new ones

      mockupUrl = formData.mockupImage 
        ? await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(formData.mockupImage!);
          })
        : existingMockup; // Use existing mockup if no new one
    } else {
      // New product mode - convert files to data URLs
      const imagePromises = formData.images.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      const mockupPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(formData.mockupImage!);
      });

      const urls = await Promise.all([...imagePromises, mockupPromise]);
      mockupUrl = urls.pop()!;
      imageUrls = urls;
    }

    const productData: Omit<Product, 'id'> = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      surfaceTone: formData.surfaceTone,
      images: imageUrls,
      mockupImage: mockupUrl,
      engravingBoundary: formData.engravingBoundary
    };

    if (editingProduct) {
      updateProduct({ ...productData, id: editingProduct.id });
    } else {
      // Let the database generate the UUID automatically
      addProduct(productData);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      surfaceTone: 'light',
      images: [],
      mockupImage: null,
      engravingBoundary: { x: 0, y: 0, width: 100, height: 100 }
    });
    setEditingProduct(null);
    setMockupPreview('');
    setExistingImages([]);
    setExistingMockup('');
    setBoundarySelection({
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isSelecting: false
    });
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      surfaceTone: product.surfaceTone,
      images: [], // Will be handled separately for editing
      mockupImage: null, // Will be handled separately for editing
      engravingBoundary: product.engravingBoundary
    });
    setExistingImages(product.images);
    setExistingMockup(product.mockupImage);
    setMockupPreview(product.mockupImage);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100">
              {product.images[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">${product.price}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  product.surfaceTone === 'light' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.surfaceTone}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(product)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteProduct(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price ($)</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Surface Type</label>
                  <Select
                    value={formData.surfaceTone}
                    onChange={(e) => handleInputChange('surfaceTone', e.target.value)}
                    required
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Product Images</label>
                  
                  {/* Show existing images if editing */}
                  {editingProduct && existingImages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Current images:</p>
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={image} 
                              alt={`Product ${index + 1}`} 
                              className="w-16 h-16 object-cover rounded border"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'images')}
                    required={!editingProduct} // Only required for new products
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {editingProduct 
                      ? 'Upload new images to replace existing ones (optional)'
                      : 'Select multiple images for product showcase'
                    }
                    {editingProduct && existingImages.length > 0 && (
                      <span className="block text-blue-600 mt-1">
                        💡 Existing images will be preserved if no new ones are uploaded
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Flat Mockup Image</label>
                  
                  {/* Show existing mockup if editing */}
                  {editingProduct && existingMockup && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Current mockup:</p>
                      <img 
                        src={existingMockup} 
                        alt="Current mockup" 
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'mockupImage')}
                    required={!editingProduct} // Only required for new products
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {editingProduct 
                      ? 'Upload new mockup to replace existing one (optional)'
                      : 'This image will be used as the design canvas'
                    }
                    {editingProduct && existingMockup && (
                      <span className="block text-blue-600 mt-1">
                        💡 Existing mockup will be preserved if no new one is uploaded
                      </span>
                    )}
                  </p>
                </div>

                {/* Engraving Boundary Selection */}
                {mockupPreview && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Set Engraving Boundaries
                    </label>
                    <p className="text-sm text-gray-600 mb-4">
                      Click and drag on the flat product image to set the area where engravings can be placed.
                    </p>
                    
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <canvas
                        ref={canvasRef}
                        className="border border-gray-300 rounded cursor-crosshair max-w-full h-auto"
                        onMouseDown={handleBoundaryMouseDown}
                        onMouseMove={handleBoundaryMouseMove}
                        onMouseUp={handleBoundaryMouseUp}
                      />
                      
                      <div className="mt-4 grid grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600">X</label>
                          <Input
                            type="number"
                            value={formData.engravingBoundary.x.toFixed(1)}
                            onChange={(e) => handleInputChange('engravingBoundary', {
                              ...formData.engravingBoundary,
                              x: parseFloat(e.target.value)
                            })}
                            step="0.1"
                            min="0"
                            max="100"
                            className="text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Y</label>
                          <Input
                            type="number"
                            value={formData.engravingBoundary.y.toFixed(1)}
                            onChange={(e) => handleInputChange('engravingBoundary', {
                              ...formData.engravingBoundary,
                              y: parseFloat(e.target.value)
                            })}
                            step="0.1"
                            min="0"
                            max="100"
                            className="text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Width</label>
                          <Input
                            type="number"
                            value={formData.engravingBoundary.width.toFixed(1)}
                            onChange={(e) => handleInputChange('engravingBoundary', {
                              ...formData.engravingBoundary,
                              width: parseFloat(e.target.value)
                            })}
                            step="0.1"
                            min="0"
                            max="100"
                            className="text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Height</label>
                          <Input
                            type="number"
                            value={formData.engravingBoundary.height.toFixed(1)}
                            onChange={(e) => handleInputChange('engravingBoundary', {
                              ...formData.engravingBoundary,
                              height: parseFloat(e.target.value)
                            })}
                            step="0.1"
                            min="0"
                            max="100"
                            className="text-sm"
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
