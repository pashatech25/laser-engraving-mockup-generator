import React from 'react';
import { CheckCircle, Download, Copy, RefreshCw } from 'lucide-react';
import { Job } from '../types';

interface JobSuccessProps {
  job: Job;
  onReset: () => void;
}

const JobSuccess: React.FC<JobSuccessProps> = ({ job, onReset }) => {
  const copyJobId = () => {
    navigator.clipboard.writeText(job.id);
  };

  const downloadMockup = () => {
    const link = document.createElement('a');
    link.href = job.mockupImage;
    link.download = `mockup-${job.id}.png`;
    link.click();
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="success-bounce mb-6">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Order Submitted Successfully!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Thank you for your order. We'll process your laser engraving job and contact you soon.
      </p>

      {/* Job Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
        
        <div className="space-y-4">
          {/* Job ID */}
          <div className="flex items-center justify-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Job ID:</span>
            <code className="bg-gray-100 px-3 py-1 rounded-md font-mono text-sm">
              {job.id}
            </code>
            <button
              onClick={copyJobId}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title="Copy Job ID"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {/* Product Info */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <span className="text-sm font-medium text-gray-700">Product:</span>
                <p className="text-sm text-gray-900">{job.product.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Price:</span>
                <p className="text-sm text-gray-900">${job.product.price.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Customer:</span>
                <p className="text-sm text-gray-900">{job.customerName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mockup Preview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Mockup</h3>
        <div className="relative">
          <img
            src={job.mockupImage}
            alt="Final Mockup"
            className="w-full max-w-md mx-auto rounded-lg border border-gray-200"
          />
          <button
            onClick={downloadMockup}
            className="absolute top-2 right-2 p-2 bg-white bg-opacity-90 rounded-md shadow-sm hover:bg-opacity-100 transition-all"
            title="Download Mockup"
          >
            <Download className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <button
          onClick={onReset}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Create Another Order</span>
        </button>
        
        <div className="text-sm text-gray-500">
          <p>We'll send you an email confirmation shortly.</p>
          <p>Keep your Job ID safe for future reference.</p>
        </div>
      </div>
    </div>
  );
};

export default JobSuccess;
