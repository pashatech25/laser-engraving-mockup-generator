import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Product, Job, TextLayer } from '../types';
import ProductSelector from '../components/ProductSelector';
import ImageUpload from '../components/ImageUpload';
import EnhancedMockupEditor from '../components/EnhancedMockupEditor';
import JobForm from '../components/JobForm';
import JobSuccess from '../components/JobSuccess';
import { sendOrderConfirmationEmail } from '../utils/email';
import { sendOrderConfirmationSMS } from '../utils/sms';

const Index: React.FC = () => {
  const { addJob } = useApp();
  const [currentStep, setCurrentStep] = useState<'product' | 'upload' | 'editor' | 'form' | 'mockup' | 'success'>('product');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [designTextLayers, setDesignTextLayers] = useState<any[]>([]);

  const handleProductSelected = (product: Product) => {
    setSelectedProduct(product);
    setCurrentStep('upload');
  };

  const handleImageUploaded = (image: string) => {
    setUploadedImage(image);
    setCurrentStep('editor');
  };

  const handleImageProcessed = (processed: string) => {
    setProcessedImage(processed);
  };

  const handleDesignUpdate = (textLayers: any[]) => {
    setDesignTextLayers(textLayers);
  };

  const resetFlow = () => {
    setCurrentStep('product');
    setSelectedProduct(null);
    setUploadedImage('');
    setProcessedImage('');
    setCurrentJob(null);
    setDesignTextLayers([]);
  };

  const handleJobSubmitted = async (formData: { name: string; email: string; phone: string; paymentOption?: string }) => {
    if (!selectedProduct || !uploadedImage || !processedImage) return;

    const newJob: Omit<Job, 'id'> = {
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      product: selectedProduct,
      uploadedImage,
      processedImage,
      mockupImage: '', // Will be set when mockup is created
      imagePosition: { x: 0, y: 0, scale: 1, rotation: 0 },
      textLayers: designTextLayers, // Will be populated from EnhancedMockupEditor
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Don't add job yet - wait for mockup generation
    // Create a temporary job object for state management
    const tempJob: Job = {
      id: 'temp-' + Date.now().toString(), // Temporary ID for state management
      ...newJob
    };
    setCurrentJob(tempJob);
    
    // Generate the mockup immediately and go to success
    await generateMockupAndGoToSuccess(newJob);
  };

  const generateMockupAndGoToSuccess = async (job: Omit<Job, 'id'>) => {
    if (!selectedProduct) return;
    
    // Generate final mockup image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx && selectedProduct) {
      // Set canvas size to match product mockup
      const mockupImg = new Image();
      mockupImg.onload = () => {
        canvas.width = mockupImg.width;
        canvas.height = mockupImg.height;
        
        // Draw mockup background
        ctx.drawImage(mockupImg, 0, 0);
        
        // Draw the processed image if it exists
        if (processedImage) {
          const processedImg = new Image();
          processedImg.onload = () => {
            // Calculate boundary dimensions
            const { x, y, width, height } = selectedProduct.engravingBoundary;
            const boundaryX = (x / 100) * canvas.width;
            const boundaryY = (y / 100) * canvas.height;
            const boundaryWidth = (width / 100) * canvas.width;
            const boundaryHeight = (height / 100) * canvas.height;
            
            // Calculate center position
            const centerX = boundaryX + boundaryWidth / 2;
            const centerY = boundaryY + boundaryHeight / 2;
            
            // Calculate scale to fit image within boundary
            const imageAspect = processedImg.width / processedImg.height;
            const boundaryAspect = boundaryWidth / boundaryHeight;
            
            let scaleX, scaleY;
            if (imageAspect > boundaryAspect) {
              scaleX = boundaryWidth / processedImg.width;
              scaleY = scaleX;
            } else {
              scaleY = boundaryHeight / processedImg.height;
              scaleX = scaleY;
            }
            
            // Apply transformations
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(scaleX, scaleY);
            
            // Draw processed image centered
            const imgWidth = processedImg.width;
            const imgHeight = processedImg.height;
            
            ctx.drawImage(
              processedImg,
              -imgWidth / 2,
              -imgHeight / 2,
              imgWidth,
              imgHeight
            );
            
            ctx.restore();
            
            // Now draw text layers on top with correct positioning
            if (job.textLayers && job.textLayers.length > 0) {
              console.log('Drawing text layers:', job.textLayers);
              console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
              console.log('Engraving boundary:', selectedProduct.engravingBoundary);
              
              job.textLayers.forEach((layer, index) => {
                ctx.save();
                
                // Calculate text position relative to the engraving boundary
                // layer.position is relative to the design canvas, we need to convert it to mockup coordinates
                const boundaryX = selectedProduct.engravingBoundary.x * canvas.width / 100;
                const boundaryY = selectedProduct.engravingBoundary.y * canvas.height / 100;
                const boundaryWidth = selectedProduct.engravingBoundary.width * canvas.width / 100;
                const boundaryHeight = selectedProduct.engravingBoundary.height * canvas.height / 100;
                
                // The design canvas in EnhancedMockupEditor is sized to match the engraving boundary
                // So layer.position.x and layer.position.y are already in the correct scale
                // We just need to offset them by the boundary position
                const mockupX = boundaryX + layer.position.x;
                const mockupY = boundaryY + layer.position.y;
                
                console.log(`Text layer ${index}:`, {
                  originalPosition: layer.position,
                  boundaryCoords: { boundaryX, boundaryY, boundaryWidth, boundaryHeight },
                  finalPosition: { mockupX, mockupY }
                });
                
                // Apply transformations
                ctx.translate(mockupX, mockupY);
                ctx.rotate(layer.rotation * Math.PI / 180);
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
                ctx.restore();
              });
            }
            
            // Convert to data URL and update job
            const mockupDataUrl = canvas.toDataURL('image/png');
            
            // Update the current job with the mockup
            const updatedJob: Omit<Job, 'id'> = {
              ...job,
              mockupImage: mockupDataUrl
            };
            
            // Add job to context only once
            addJob(updatedJob).then(async () => {
              // Send order confirmation email
              try {
                const emailSent = await sendOrderConfirmationEmail({
                  id: 'temp-' + Date.now().toString(),
                  ...updatedJob
                });
                if (emailSent) {
                  console.log('Order confirmation email sent successfully');
                } else {
                  console.log('Failed to send order confirmation email');
                }
              } catch (error) {
                console.error('Error sending order confirmation email:', error);
              }
              
              // Send order confirmation SMS
              try {
                const tempJob: Job = {
                  id: 'temp-' + Date.now().toString(),
                  ...updatedJob
                };
                await sendOrderConfirmationSMS(tempJob);
                console.log('Order confirmation SMS sent successfully');
              } catch (error) {
                console.error('Error sending order confirmation SMS:', error);
              }
              
              // Create a temporary job object for state management
              const tempJob: Job = {
                id: 'temp-' + Date.now().toString(),
                ...updatedJob
              };
              setCurrentJob(tempJob);
              setCurrentStep('success');
            }).catch(error => {
              console.error('Error adding job:', error);
            });
          };
          processedImg.src = processedImage;
        } else {
          // No processed image, but we might have text layers
          if (job.textLayers && job.textLayers.length > 0) {
            console.log('Drawing text layers (no processed image):', job.textLayers);
            console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
            console.log('Engraving boundary:', selectedProduct.engravingBoundary);
            
            job.textLayers.forEach((layer, index) => {
              ctx.save();
              
              // Calculate text position relative to the engraving boundary
              const boundaryX = selectedProduct.engravingBoundary.x * canvas.width / 100;
              const boundaryY = selectedProduct.engravingBoundary.y * canvas.height / 100;
              const boundaryWidth = selectedProduct.engravingBoundary.width * canvas.width / 100;
              const boundaryHeight = selectedProduct.engravingBoundary.height * canvas.height / 100;
              
              // The design canvas in EnhancedMockupEditor is sized to match the engraving boundary
              // So layer.position.x and layer.position.y are already in the correct scale
              // We just need to offset them by the boundary position
              const mockupX = boundaryX + layer.position.x;
              const mockupY = boundaryY + layer.position.y;
              
              console.log(`Text layer ${index} (no processed image):`, {
                originalPosition: layer.position,
                boundaryCoords: { boundaryX, boundaryY, boundaryWidth, boundaryHeight },
                finalPosition: { mockupX, mockupY }
              });
              
              // Apply transformations
              ctx.translate(mockupX, mockupY);
              ctx.rotate(layer.rotation * Math.PI / 180);
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
              ctx.restore();
            });
          }
          
          const mockupDataUrl = canvas.toDataURL('image/png');
          
          const updatedJob: Omit<Job, 'id'> = {
            ...job,
            mockupImage: mockupDataUrl
          };
          
          // Add job to context only once
          addJob(updatedJob).then(async () => {
            // Send order confirmation email
            try {
              const emailSent = await sendOrderConfirmationEmail({
                id: 'temp-' + Date.now().toString(),
                ...updatedJob
              });
              if (emailSent) {
                console.log('Order confirmation email sent successfully');
              } else {
                console.log('Failed to send order confirmation email');
              }
            } catch (error) {
              console.error('Error sending order confirmation email:', error);
            }
            
            // Send order confirmation SMS
            try {
              const tempJob: Job = {
                id: 'temp-' + Date.now().toString(),
                ...updatedJob
              };
              await sendOrderConfirmationSMS(tempJob);
              console.log('Order confirmation SMS sent successfully');
            } catch (error) {
              console.error('Error sending order confirmation SMS:', error);
            }
            
            // Create a temporary job object for state management
            const tempJob: Job = {
              id: 'temp-' + Date.now().toString(),
              ...updatedJob
            };
            setCurrentJob(tempJob);
            setCurrentStep('success');
          }).catch(error => {
            console.error('Error adding job:', error);
          });
        }
      };
      mockupImg.src = selectedProduct.mockupImage;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'product':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Laser Engraving Mockup Generator
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Upload your image, select a product, and create a professional mockup for laser engraving.
              </p>
            </div>
            <ProductSelector onProductSelected={handleProductSelected} />
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Upload Your Image
              </h2>
              <p className="text-lg text-gray-600">
                Upload an image to engrave on {selectedProduct?.name}
              </p>
            </div>
            <ImageUpload 
              onImageUploaded={handleImageUploaded}
              surfaceTone={selectedProduct?.surfaceTone || 'light'}
              onProcessedImage={handleImageProcessed}
            />
          </div>
        );

      case 'editor':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Position Your Design
              </h2>
              <p className="text-lg text-gray-600">
                Drag, resize, and rotate your design to position it perfectly on the product
              </p>
            </div>
            <EnhancedMockupEditor 
              onContinue={() => setCurrentStep('form')}
              selectedProduct={selectedProduct}
              processedImage={processedImage}
              isAdmin={false}
              currentJob={null}
              onJobUpdate={() => {}}
              onDesignUpdate={handleDesignUpdate}
            />
          </div>
        );

      case 'form':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Complete Your Order
              </h2>
              <p className="text-lg text-gray-600">
                Provide your contact information to submit your laser engraving job
              </p>
            </div>
            <JobForm onSubmit={handleJobSubmitted} selectedProduct={selectedProduct!} />
          </div>
        );
      case 'mockup':
        return (
          <div className="max-w-6xl mx-auto">
            <EnhancedMockupEditor 
              onContinue={() => {}} // No continue button in mockup step
              selectedProduct={selectedProduct}
              processedImage={processedImage}
              isAdmin={false}
              currentJob={currentJob}
              onJobUpdate={setCurrentJob}
              onDesignUpdate={handleDesignUpdate}
            />
          </div>
        );
      case 'success':
        return (
          <JobSuccess 
            job={currentJob!} 
            onReset={resetFlow}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Progress Bar */}
      {currentStep !== 'success' && (
        <div className="flex justify-center mb-8">
          {['product', 'upload', 'editor', 'form', 'mockup'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step
                    ? 'bg-blue-600 text-white'
                    : index < ['product', 'upload', 'editor', 'form', 'mockup'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              {index < 4 && (
                <div
                  className={`w-16 h-1 ${
                    index < ['product', 'upload', 'editor', 'form', 'mockup'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step Content */}
      {renderStep()}
    </div>
  );
};

export default Index;
