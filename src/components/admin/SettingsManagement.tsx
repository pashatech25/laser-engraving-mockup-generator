import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Settings, Database, Trash2, Download, Upload, Info } from 'lucide-react';

const SettingsManagement: React.FC = () => {
  const { products, jobs, logoutAdmin } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportData = () => {
    setIsExporting(true);
    
    const data = {
      products,
      jobs,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laser-engraving-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        console.log('Import data:', data);
        // In a real app, you would validate and import the data
        alert('Data import functionality would be implemented here');
      } catch (error) {
        alert('Invalid data format');
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      if (window.confirm('This will delete ALL products and orders. Are you absolutely sure?')) {
        // In a real app, you would clear the data
        alert('Data clearing functionality would be implemented here');
      }
    }
  };

  const getSystemStats = () => {
    const totalProducts = products.length;
    const totalJobs = jobs.length;
    const totalRevenue = jobs.reduce((sum, job) => sum + job.product.price, 0);
    const uniqueCustomers = new Set(jobs.map(job => job.customerEmail)).size;
    const pendingJobs = jobs.filter(job => job.status === 'pending').length;
    
    return {
      totalProducts,
      totalJobs,
      totalRevenue,
      uniqueCustomers,
      pendingJobs
    };
  };

  const stats = getSystemStats();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Settings & System</h2>
        <p className="text-gray-600">Manage system settings and data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              System Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">App Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-medium">Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage:</span>
                <span className="font-medium">Local Storage</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2 text-green-600" />
              Data Statistics
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Products:</span>
                <span className="font-medium">{stats.totalProducts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-medium">{stats.totalJobs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-medium">${stats.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unique Customers:</span>
                <span className="font-medium">{stats.uniqueCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Orders:</span>
                <span className="font-medium">{stats.pendingJobs}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-purple-600" />
              Data Management
            </h3>
            
            <div className="space-y-4">
              {/* Export Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Data
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Download all products and orders as a JSON file
                </p>
                <button
                  onClick={exportData}
                  disabled={isExporting}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isExporting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Export All Data</span>
                    </>
                  )}
                </button>
              </div>

              {/* Import Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Import Data
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Import products and orders from a JSON file
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md cursor-pointer transition-colors ${
                      isImporting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Choose File to Import</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Clear Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clear All Data
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Remove all products and orders (cannot be undone)
                </p>
                <button
                  onClick={clearAllData}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-orange-600" />
              Account Management
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Logout
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Sign out of the admin panel
                </p>
                <button
                  onClick={logoutAdmin}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>This is a demo application using local storage</li>
                <li>Data is stored in your browser and will be lost if you clear browser data</li>
                <li>For production use, implement proper backend storage and authentication</li>
                <li>Regular data backups are recommended</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
