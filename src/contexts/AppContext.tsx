import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Job } from '../types';
import { supabase, TABLES } from '../lib/supabase';

interface AppState {
  products: Product[];
  jobs: Job[];
  isAdmin: boolean;
}

interface AppContextType extends AppState {
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addJob: (job: Job) => Promise<void>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  setIsAdmin: (isAdmin: boolean) => void;
  refreshData: () => Promise<void>;
  // Legacy functions for backward compatibility
  loginAdmin: () => void;
  logoutAdmin: () => void;
  setSelectedProduct: (product: Product | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load data from Supabase on component mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from(TABLES.PRODUCTS)
        .select('*')
        .order('createdAt', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Load jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from(TABLES.JOBS)
        .select('*')
        .order('createdAt', { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { error } = await supabase
        .from(TABLES.PRODUCTS)
        .insert([product]);

      if (error) throw error;
      
      // Refresh data from database
      await refreshData();
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from(TABLES.PRODUCTS)
        .update(product)
        .eq('id', product.id);

      if (error) throw error;
      
      // Refresh data from database
      await refreshData();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from(TABLES.PRODUCTS)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh data from database
      await refreshData();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const addJob = async (job: Job) => {
    try {
      const { error } = await supabase
        .from(TABLES.JOBS)
        .insert([job]);

      if (error) throw error;
      
      // Refresh data from database
      await refreshData();
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  };

  const updateJob = async (job: Job) => {
    try {
      const { error } = await supabase
        .from(TABLES.JOBS)
        .update(job)
        .eq('id', job.id);

      if (error) throw error;
      
      // Refresh data from database
      await refreshData();
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from(TABLES.JOBS)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh data from database
      await refreshData();
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  };

  // Legacy functions for backward compatibility
  const loginAdmin = () => {
    setIsAdmin(true);
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  const setSelectedProduct = (_product: Product | null) => {
    // This function is no longer needed but kept for compatibility
    // Products are now managed through the products array
  };

  const value: AppContextType = {
    products,
    jobs,
    isAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    addJob,
    updateJob,
    deleteJob,
    setIsAdmin,
    refreshData,
    loginAdmin,
    logoutAdmin,
    setSelectedProduct
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
