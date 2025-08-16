import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Building, 
  Package, 
  FileText, 
  Users, 
  Settings, 
  Plus, 
  LogOut,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, tenant, signOut, createTenant, joinTenant } = useAuth();
  const navigate = useNavigate();
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [isJoiningTenant, setIsJoiningTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [tenantSlugToJoin, setTenantSlugToJoin] = useState('');

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim() || !newTenantSlug.trim()) return;

    setIsCreatingTenant(true);
    try {
      const { error } = await createTenant(newTenantName.trim(), newTenantSlug.trim());
      if (error) {
        alert(`Error creating tenant: ${error.message}`);
      } else {
        setIsCreatingTenant(false);
        setNewTenantName('');
        setNewTenantSlug('');
      }
    } catch (error) {
      alert('An unexpected error occurred');
    } finally {
      setIsCreatingTenant(false);
    }
  };

  const handleJoinTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantSlugToJoin.trim()) return;

    setIsJoiningTenant(true);
    try {
      const { error } = await joinTenant(tenantSlugToJoin.trim());
      if (error) {
        alert(`Error joining tenant: ${error.message}`);
      } else {
        setIsJoiningTenant(false);
        setTenantSlugToJoin('');
      }
    } catch (error) {
      alert('An unexpected error occurred');
    } finally {
      setIsJoiningTenant(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Laser Engraving</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.full_name || user.email}</p>
                <p className="text-xs text-gray-500">{user.company_name || 'No company'}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!tenant ? (
          // No tenant - show tenant creation/joining options
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Laser Engraving!</h2>
              <p className="text-lg text-gray-600">
                Get started by creating your workspace or joining an existing one
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Create Tenant */}
              <Card className="border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Create Workspace</CardTitle>
                  <CardDescription>
                    Start your own workspace for your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTenant} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Workspace Name
                      </label>
                      <Input
                        value={newTenantName}
                        onChange={(e) => setNewTenantName(e.target.value)}
                        placeholder="My Company"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Workspace URL
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          workspace.
                        </span>
                        <Input
                          value={newTenantSlug}
                          onChange={(e) => setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="mycompany"
                          className="rounded-l-none"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isCreatingTenant}
                      className="w-full"
                    >
                      {isCreatingTenant ? 'Creating...' : 'Create Workspace'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Join Tenant */}
              <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-600" />
                  </div>
                  <CardTitle className="text-xl">Join Workspace</CardTitle>
                  <CardDescription>
                    Join an existing workspace with an invite
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJoinTenant} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Workspace URL
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          workspace.
                        </span>
                        <Input
                          value={tenantSlugToJoin}
                          onChange={(e) => setTenantSlugToJoin(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="companyname"
                          className="rounded-l-none"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isJoiningTenant}
                      variant="outline"
                      className="w-full"
                    >
                      {isJoiningTenant ? 'Joining...' : 'Join Workspace'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Has tenant - show main dashboard
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to {tenant.name}
              </h2>
              <p className="text-gray-600">
                Manage your products, orders, and team members
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Products</p>
                      <p className="text-2xl font-bold text-gray-900">Manage</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 mt-4 ml-auto" />
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/orders')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Orders</p>
                      <p className="text-2xl font-bold text-gray-900">View</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 mt-4 ml-auto" />
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/team')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Team</p>
                      <p className="text-2xl font-bold text-gray-900">Manage</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 mt-4 ml-auto" />
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin/settings')}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Settings</p>
                      <p className="text-2xl font-bold text-gray-900">Configure</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 mt-4 ml-auto" />
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Workspace Overview</CardTitle>
                <CardDescription>
                  Quick summary of your workspace activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-sm text-gray-600">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-sm text-gray-600">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">1</p>
                    <p className="text-sm text-gray-600">Team Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
