import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Job } from '../../types';
import { Users, Mail, Phone, Package, Calendar } from 'lucide-react';

const CustomerManagement: React.FC = () => {
  const { jobs } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Get unique customers
  const customers = Array.from(new Set(jobs.map(job => job.customerEmail))).map(email => {
    const customerJobs = jobs.filter(job => job.customerEmail === email);
    const firstJob = customerJobs[0];
    return {
      email,
      name: firstJob.customerName,
      phone: firstJob.customerPhone,
      totalOrders: customerJobs.length,
      totalSpent: customerJobs.reduce((sum, job) => sum + job.product.price, 0),
      firstOrder: new Date(Math.min(...customerJobs.map(job => new Date(job.createdAt).getTime()))),
      lastOrder: new Date(Math.max(...customerJobs.map(job => new Date(job.createdAt).getTime())))
    };
  });

  const getCustomerOrders = (email: string) => {
    return jobs.filter(job => job.customerEmail === email);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Customer Management</h2>
        <p className="text-gray-600">View customer information and order history</p>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div key={customer.email} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(selectedCustomer === customer.email ? null : customer.email)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {selectedCustomer === customer.email ? 'Hide' : 'View Orders'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>{customer.totalOrders} orders</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Customer since {customer.firstOrder.toLocaleDateString()}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="text-lg font-semibold text-gray-900">
                  ${customer.totalSpent.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">Total spent</div>
              </div>
            </div>

            {/* Customer Orders */}
            {selectedCustomer === customer.email && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">Order History</h4>
                <div className="space-y-2">
                  {getCustomerOrders(customer.email).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{job.product.name}</div>
                        <div className="text-gray-500">#{job.id}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium text-gray-900">${job.product.price.toFixed(2)}</div>
                        <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          job.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Yet</h3>
          <p className="text-gray-500">Customers will appear here once they place orders.</p>
        </div>
      )}

      {/* Customer Statistics */}
      {customers.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-2xl font-semibold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{jobs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Orders/Customer</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {(jobs.length / customers.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${jobs.reduce((sum, job) => sum + job.product.price, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
