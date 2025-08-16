import React, { useRef, useEffect, useState } from 'react';
import { RotateCw, ZoomIn, Plus, Trash2, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Product } from '../types';
import { Job } from '../types';

interface TextLayer {
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

interface MockupState {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface EnhancedMockupEditorProps {
  onContinue: () => void;
  selectedProduct: Product | null;
  processedImage: string;
  isAdmin?: boolean;
  currentJob: Job | null;
  onJobUpdate: (job: Job) => void;
  onDesignUpdate?: (textLayers: any[]) => void;
}

const EnhancedMockupEditor: React.FC<EnhancedMockupEditorProps> = ({ 
  onContinue, 
  selectedProduct, 
  processedImage,
  isAdmin = false,
  currentJob,
  onJobUpdate,
  onDesignUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [mockupState, setMockupState] = useState<MockupState>({
    position: { x: 0, y: 0 },
    scale: 1,
    rotation: 0
  });

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Courier New', 'Impact', 'Comic Sans MS', 'Tahoma', 'Trebuchet MS'
  ];

  useEffect(() => {
    if (selectedProduct) {
      setMockupState({
        position: { x: 0, y: 0 },
        scale: 1,
        rotation: 0
      });
    }
  }, [selectedProduct]);

  useEffect(() => {
    drawMockup();
  }, [mockupState, selectedProduct, textLayers]);

  const addTextLayer = () => {
    if (!selectedProduct) return;
    
    // Calculate boundary dimensions for positioning
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { width, height } = selectedProduct.engravingBoundary;
    const boundaryWidth = (width / 100) * canvas.width;
    const boundaryHeight = (height / 100) * canvas.height;
    
    // Position text in the center of the boundary
    const centerX = boundaryWidth / 2;
    const centerY = boundaryHeight / 2;
    
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      text: 'Sample Text',
      font: 'Arial',
      fontSize: 24,
      color: '#000000',
      position: { x: centerX, y: centerY },
      scale: 1,
      rotation: 0,
      isBold: false,
      isItalic: false
    };
    setTextLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
    
    // Notify parent component of design changes
    if (onDesignUpdate) {
      onDesignUpdate([...textLayers, newLayer]);
    }
  };

  const updateTextLayer = (id: string, updates: Partial<TextLayer>) => {
    setTextLayers(prev => prev.map(layer => {
      if (layer.id === id) {
        const updatedLayer = { ...layer, ...updates };
        
        // If position is being updated, constrain it to the boundary
        if (updates.position && selectedProduct) {
          const canvas = canvasRef.current;
          if (canvas) {
            const { width, height } = selectedProduct.engravingBoundary;
            const boundaryWidth = (width / 100) * canvas.width;
            const boundaryHeight = (height / 100) * canvas.height;
            
            // Constrain text position to stay within boundary
            const constrainedX = Math.max(0, Math.min(updates.position.x, boundaryWidth));
            const constrainedY = Math.max(0, Math.min(updates.position.y, boundaryHeight));
            
            updatedLayer.position = { x: constrainedX, y: constrainedY };
          }
        }
        
        return updatedLayer;
      }
      return layer;
    }));
    
    // Notify parent component of design changes
    if (onDesignUpdate) {
      onDesignUpdate(textLayers);
    }
  };

  const deleteTextLayer = (id: string) => {
    setTextLayers(prev => prev.filter(layer => layer.id !== id));
    if (selectedLayer === id) {
      setSelectedLayer(null);
    }
    
    // Notify parent component of design changes
    if (onDesignUpdate) {
      onDesignUpdate(textLayers);
    }
  };

  const drawMockup = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedProduct) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match the mockup image dimensions
    const mockupImg = new Image();
    mockupImg.onload = () => {
      // Set canvas to match mockup image size
      canvas.width = mockupImg.width;
      canvas.height = mockupImg.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw mockup image at full size
      ctx.drawImage(mockupImg, 0, 0);

      // Apply clipping mask for engraving boundary
      if (selectedProduct.engravingBoundary) {
        const { x, y, width, height } = selectedProduct.engravingBoundary;
        
        // Convert percentages to pixel coordinates
        const boundaryX = (x / 100) * canvas.width;
        const boundaryY = (y / 100) * canvas.height;
        const boundaryWidth = (width / 100) * canvas.width;
        const boundaryHeight = (height / 100) * canvas.height;

        // Create clipping path
        ctx.save();
        ctx.beginPath();
        ctx.rect(boundaryX, boundaryY, boundaryWidth, boundaryHeight);
        ctx.clip();

        // Load and draw processed image within boundary
        if (processedImage) {
          const processedImg = new Image();
          processedImg.onload = () => {
            // Calculate position within boundary
            const boundaryCenterX = boundaryX + boundaryWidth / 2;
            const boundaryCenterY = boundaryY + boundaryHeight / 2;

            // Calculate scale to fit image within boundary
            const imageAspect = processedImg.width / processedImg.height;
            const boundaryAspect = boundaryWidth / boundaryHeight;
            
            let scaleX, scaleY;
            if (imageAspect > boundaryAspect) {
              // Image is wider than boundary, fit to width
              scaleX = boundaryWidth / processedImg.width;
              scaleY = scaleX;
            } else {
              // Image is taller than boundary, fit to height
              scaleY = boundaryHeight / processedImg.height;
              scaleX = scaleY;
            }
            
            // Apply user's scale adjustment
            const finalScaleX = scaleX * mockupState.scale;
            const finalScaleY = scaleY * mockupState.scale;

            // Ensure image stays within boundary when scaled
            const maxScaleX = boundaryWidth / processedImg.width;
            const maxScaleY = boundaryHeight / processedImg.height;
            const constrainedScaleX = Math.min(finalScaleX, maxScaleX);
            const constrainedScaleY = Math.min(finalScaleY, maxScaleY);

            // Apply transformations
            ctx.save();
            ctx.translate(boundaryCenterX, boundaryCenterY);
            ctx.rotate((mockupState.rotation * Math.PI) / 180);
            ctx.scale(constrainedScaleX, constrainedScaleY);

            // Draw processed image centered
            const imgWidth = processedImg.width;
            const imgHeight = processedImg.height;
            
            ctx.drawImage(
              processedImg,
              -imgWidth / 2 + mockupState.position.x / constrainedScaleX,
              -imgHeight / 2 + mockupState.position.y / constrainedScaleY,
              imgWidth,
              imgHeight
            );

            ctx.restore();
          };
          processedImg.src = processedImage;
        }

        // Draw text layers within boundary
        textLayers.forEach(layer => {
          ctx.save();
          ctx.translate(boundaryX + layer.position.x, boundaryY + layer.position.y);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.scale(layer.scale, layer.scale);

          // Set font properties
          const fontWeight = layer.isBold ? 'bold' : 'normal';
          const fontStyle = layer.isItalic ? 'italic' : 'normal';
          ctx.font = `${fontStyle} ${fontWeight} ${layer.fontSize}px ${layer.font}`;
          ctx.fillStyle = layer.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Draw text
          ctx.fillText(layer.text, 0, 0);

          // Draw selection indicator
          if (selectedLayer === layer.id) {
            const metrics = ctx.measureText(layer.text);
            const textWidth = metrics.width;
            const textHeight = layer.fontSize;
            
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(-textWidth/2, -textHeight/2, textWidth, textHeight);
            ctx.setLineDash([]);
          }

          ctx.restore();
        });

        ctx.restore();
      }

      // Draw boundary outline
      if (selectedProduct.engravingBoundary) {
        const { x, y, width, height } = selectedProduct.engravingBoundary;
        
        const boundaryX = (x / 100) * canvas.width;
        const boundaryY = (y / 100) * canvas.height;
        const boundaryWidth = (width / 100) * canvas.width;
        const boundaryHeight = (height / 100) * canvas.height;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(boundaryX, boundaryY, boundaryWidth, boundaryHeight);
        ctx.setLineDash([]);
      }
    };
    mockupImg.src = selectedProduct.mockupImage;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedProduct) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if click is within engraving boundary
    const { x, y, width, height } = selectedProduct.engravingBoundary;
    
    // Convert percentages to pixel coordinates
    const boundaryX = (x / 100) * canvas.width;
    const boundaryY = (y / 100) * canvas.height;
    const boundaryWidth = (width / 100) * canvas.width;
    const boundaryHeight = (height / 100) * canvas.height;

    if (clickX >= boundaryX && clickX <= boundaryX + boundaryWidth &&
        clickY >= boundaryY && clickY <= boundaryY + boundaryHeight) {
      // Click is within boundary, select text layer or add new one
      if (selectedLayer) {
        // Update selected layer position
        updateTextLayer(selectedLayer, {
          position: { 
            x: clickX - boundaryX, 
            y: clickY - boundaryY 
          }
        });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - mockupState.position.x,
        y: e.clientY - rect.top - mockupState.position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedProduct) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;

    // Constrain position within engraving boundary
    const canvas = canvasRef.current;
    if (canvas) {
      const { x, y, width, height } = selectedProduct.engravingBoundary;
      
      // Convert percentages to pixel coordinates
      const boundaryX = (x / 100) * canvas.width;
      const boundaryY = (y / 100) * canvas.height;
      const boundaryWidth = (width / 100) * canvas.width;
      const boundaryHeight = (height / 100) * canvas.height;

      // Constrain the position to keep the image within the boundary
      const maxX = boundaryX + boundaryWidth - 50; // Leave some margin
      const maxY = boundaryY + boundaryHeight - 50;
      
      const constrainedX = Math.max(boundaryX, Math.min(newX, maxX));
      const constrainedY = Math.max(boundaryY, Math.min(newY, maxY));

      setMockupState(prev => ({
        ...prev,
        position: { x: constrainedX, y: constrainedY }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Save the current state for later use
    console.log('Mockup state updated:', mockupState);
  };

  const handleScaleChange = (value: number) => {
    setMockupState(prev => ({ ...prev, scale: value / 100 }));
  };

  const handleRotationChange = (value: number) => {
    setMockupState(prev => ({ ...prev, rotation: value }));
  };

  const resetTransformations = () => {
    setMockupState({
      position: { x: 0, y: 0 },
      scale: 1,
      rotation: 0
    });
  };

  const downloadProcessedImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'processed-image.png';
      link.click();
    }
  };

  const downloadCompleteMockup = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Create a temporary canvas to ensure proper rendering
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        // Draw the current canvas content
        tempCtx.drawImage(canvas, 0, 0);
        
        // Convert to data URL and download
        const link = document.createElement('a');
        link.href = tempCanvas.toDataURL('image/png');
        link.download = 'complete-mockup.png';
        link.click();
      }
    }
  };

  const downloadTextAsSVG = () => {
    if (textLayers.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !selectedProduct) return;
    
    const { width, height } = selectedProduct.engravingBoundary;
    const boundaryWidth = (width / 100) * canvas.width;
    const boundaryHeight = (height / 100) * canvas.height;
    
    // Create SVG content
    let svgContent = `<svg width="${boundaryWidth}" height="${boundaryHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    textLayers.forEach(layer => {
      const fontWeight = layer.isBold ? 'bold' : 'normal';
      const fontStyle = layer.isItalic ? 'italic' : 'normal';
      
      svgContent += `
        <text 
          x="${layer.position.x}" 
          y="${layer.position.y + layer.fontSize/2}" 
          font-family="${layer.font}" 
          font-size="${layer.fontSize}" 
          font-weight="${fontWeight}" 
          font-style="${fontStyle}" 
          fill="${layer.color}"
          text-anchor="middle"
          transform="rotate(${layer.rotation} ${layer.position.x} ${layer.position.y})"
        >${layer.text}</text>
      `;
    });
    
    svgContent += '</svg>';
    
    // Create and download SVG file
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'text-layers.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleContinue = () => {
    // Save current design state to job
    if (selectedProduct && processedImage) {
      if (currentJob) {
        // Update existing job with current design state
        const updatedJob: Job = {
          ...currentJob,
          mockupImage: '', // Will be generated in the next step
          imagePosition: {
            x: mockupState.position.x,
            y: mockupState.position.y,
            scale: mockupState.scale,
            rotation: mockupState.rotation
          },
          textLayers: textLayers
        };
        
        // Update the job in parent component
        onJobUpdate(updatedJob);
      } else {
        // For new jobs, we need to pass the text layers to the parent
        // This will be handled in the Index.tsx when creating the job
      }
      
      // Proceed to next step
      onContinue();
    }
  };

  if (!selectedProduct) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select a product first.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Design Preview - Left Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Design Preview</h3>
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm font-medium">
              Red dashed box shows engraving area - Content auto-placed here
            </p>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="relative">
            {!selectedProduct?.mockupImage && (
              <div className="flex items-center justify-center h-64 bg-gray-100">
                <p className="text-gray-500">Loading mockup image...</p>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-h-96 object-contain cursor-pointer"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>

        {/* Image Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center">
              <ZoomIn className="h-4 w-4 mr-2" />
              Scale: {Math.round(mockupState.scale * 100)}%
            </label>
            <Slider
              value={mockupState.scale * 100}
              onValueChange={handleScaleChange}
              min={10}
              max={200}
              step={5}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center">
              <RotateCw className="h-4 w-4 mr-2" />
              Rotation: {mockupState.rotation}°
            </label>
            <Slider
              value={mockupState.rotation}
              onValueChange={handleRotationChange}
              min={-180}
              max={180}
              step={5}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button onClick={resetTransformations} variant="outline" size="sm">
            Reset Position
          </Button>
          <Button onClick={downloadCompleteMockup} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Download Complete Mockup
          </Button>
        </div>

        {/* Continue Button */}
        {onContinue && typeof onContinue === 'function' && (
          <div className="text-center pt-6">
            <Button 
              onClick={handleContinue} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
            >
              Continue to Order Form
            </Button>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Text Layers */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Text Layers ({textLayers.length})</h4>
            <Button onClick={addTextLayer} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Text
            </Button>
          </div>

          {textLayers.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No text layers yet. Click 'Add Text' to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {textLayers.map((layer) => (
                <div
                  key={layer.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedLayer === layer.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedLayer(layer.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium truncate">{layer.text}</span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTextLayer(layer.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 p-1 h-6 w-6"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {selectedLayer === layer.id && (
                    <div className="space-y-2 text-sm">
                      <Input
                        value={layer.text}
                        onChange={(e) => updateTextLayer(layer.id, { text: e.target.value })}
                        placeholder="Enter text"
                        className="text-xs"
                      />
                      
                      <Select
                        value={layer.font}
                        onChange={(e) => updateTextLayer(layer.id, { font: e.target.value })}
                        className="text-xs"
                      >
                        {fonts.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </Select>

                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={layer.fontSize}
                          onChange={(e) => updateTextLayer(layer.id, { fontSize: parseInt(e.target.value) })}
                          min="8"
                          max="72"
                          className="text-xs w-16"
                        />
                        <span className="text-xs text-gray-500">px</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={layer.color}
                          onChange={(e) => updateTextLayer(layer.id, { color: e.target.value })}
                          className="w-8 h-6 p-0 border-0"
                        />
                        <Button
                          onClick={() => updateTextLayer(layer.id, { isBold: !layer.isBold })}
                          variant={layer.isBold ? "default" : "outline"}
                          size="sm"
                          className="text-xs px-2"
                        >
                          B
                        </Button>
                        <Button
                          onClick={() => updateTextLayer(layer.id, { isItalic: !layer.isItalic })}
                          variant={layer.isItalic ? "default" : "outline"}
                          size="sm"
                          className="text-xs px-2"
                        >
                          I
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Scale</label>
                          <Slider
                            value={layer.scale * 100}
                            onValueChange={(value) => updateTextLayer(layer.id, { scale: value / 100 })}
                            min={25}
                            max={200}
                            step={5}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Rotation</label>
                          <Slider
                            value={layer.rotation}
                            onValueChange={(value) => updateTextLayer(layer.id, { rotation: value })}
                            min={-180}
                            max={180}
                            step={5}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Download Options */}
        {isAdmin && (
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold mb-4">Download Options</h4>
            <div className="space-y-3">
              <Button 
                onClick={downloadProcessedImage} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!processedImage}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Processed Image
              </Button>
              <Button 
                onClick={downloadCompleteMockup} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Complete Mockup
              </Button>
              <Button 
                onClick={downloadTextAsSVG} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={textLayers.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Text as SVG
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMockupEditor;
