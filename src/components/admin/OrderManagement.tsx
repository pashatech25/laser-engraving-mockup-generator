import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Job } from '../../types';
import { Eye, Clock, CheckCircle, XCircle, Download, FileText } from 'lucide-react';

const OrderManagement: React.FC = () => {
  const { jobs, updateJob } = useApp();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredJobs = jobs.filter(job => 
    filterStatus === 'all' || job.status === filterStatus
  );

  const updateJobStatus = (jobId: string, status: Job['status']) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      updateJob({ ...job, status });
    }
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
        
        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#{job.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{job.customerName}</div>
                    <div className="text-sm text-gray-500">{job.customerEmail}</div>
                    <div className="text-sm text-gray-500">{job.customerPhone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{job.product.name}</div>
                    <div className="text-sm text-gray-500">${job.product.price.toFixed(2)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(job.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(job.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <select
                      value={job.status}
                      onChange={(e) => updateJobStatus(job.id, e.target.value as Job['status'])}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500">
            {filterStatus === 'all' ? 'No orders have been placed yet.' : `No orders with status "${filterStatus}".`}
          </p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Order Details - #{selectedJob.id}
                </h3>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedJob.customerName}</p>
                    <p><span className="font-medium">Email:</span> {selectedJob.customerEmail}</p>
                    <p><span className="font-medium">Phone:</span> {selectedJob.customerPhone}</p>
                  </div>
                </div>

                {/* Product Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Product Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Product:</span> {selectedJob.product.name}</p>
                    <p><span className="font-medium">Price:</span> ${selectedJob.product.price.toFixed(2)}</p>
                    <p><span className="font-medium">Surface:</span> {selectedJob.product.surfaceTone}</p>
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedJob.status)}`}>
                        {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                      </span>
                    </p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedJob.createdAt).toLocaleString()}</p>
                    <p><span className="font-medium">Job ID:</span> {selectedJob.id}</p>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                  <div className="space-y-2">
                    <select
                      value={selectedJob.status}
                      onChange={(e) => updateJobStatus(selectedJob.id, e.target.value as Job['status'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Assets & Downloads</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedJob.uploadedImage;
                      link.download = `original-image-${selectedJob.id}.png`;
                      link.click();
                    }}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Original Image</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedJob.processedImage;
                      link.download = `processed-image-${selectedJob.id}.png`;
                      link.click();
                    }}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Processed Image</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedJob.mockupImage;
                      link.download = `mockup-${selectedJob.id}.png`;
                      link.click();
                    }}
                    className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Mockup</span>
                  </button>
                </div>
                
                {/* Text Layers Section */}
                {selectedJob.textLayers && selectedJob.textLayers.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Text Layers ({selectedJob.textLayers.length})</h5>
                    <div className="bg-gray-50 p-3 rounded border">
                      <div className="space-y-2 mb-3">
                        {selectedJob.textLayers.map((layer, index) => (
                          <div key={layer.id} className="text-sm text-gray-600">
                            <span className="font-medium">Text {index + 1}:</span> "{layer.text}" - {layer.font} {layer.fontSize}px
                            {layer.isBold && <span className="text-blue-600 ml-1">Bold</span>}
                            {layer.isItalic && <span className="text-blue-600 ml-1">Italic</span>}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          // Create SVG content for text layers
                          const { width, height } = selectedJob.product.engravingBoundary;
                          const boundaryWidth = (width / 100) * 800; // Default canvas width
                          const boundaryHeight = (height / 100) * 600; // Default canvas height
                          
                          let svgContent = `<svg width="${boundaryWidth}" height="${boundaryHeight}" xmlns="http://www.w3.org/2000/svg">`;
                          
                          selectedJob.textLayers.forEach(layer => {
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
                          link.download = `text-layers-${selectedJob.id}.svg`;
                          link.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Text as SVG</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
