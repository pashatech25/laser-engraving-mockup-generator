-- Multi-Tenant SaaS Database Migration Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (WARNING: This will delete all data)
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenant_members table for team collaboration
CREATE TABLE public.tenant_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Create products table with multi-tenancy
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  surface_tone TEXT DEFAULT 'light' CHECK (surface_tone IN ('light', 'dark')),
  mockup_image TEXT,
  engraving_boundary JSONB DEFAULT '{"x": 0, "y": 0, "width": 100, "height": 100}',
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table with multi-tenancy
CREATE TABLE public.jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  product JSONB NOT NULL,
  uploaded_image TEXT,
  processed_image TEXT,
  mockup_image TEXT,
  image_position JSONB DEFAULT '{"x": 0, "y": 0, "scale": 1, "rotation": 0}',
  text_layers JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow new user profile creation" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for tenants
CREATE POLICY "Tenant members can view tenant" ON public.tenants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Tenant owners can manage tenant" ON public.tenants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = id AND user_id = auth.uid() AND role = 'owner'
  )
);

-- RLS Policies for tenant_members
CREATE POLICY "Tenant members can view team" ON public.tenant_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = tenant_members.tenant_id AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Tenant owners can manage team" ON public.tenant_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = tenant_members.tenant_id AND user_id = auth.uid() AND role = 'owner'
  )
);

-- RLS Policies for products
CREATE POLICY "Tenant members can view products" ON public.products FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = products.tenant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Tenant members can manage products" ON public.products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = products.tenant_id AND user_id = auth.uid()
  )
);

-- RLS Policies for jobs
CREATE POLICY "Tenant members can view jobs" ON public.jobs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = jobs.tenant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Tenant members can manage jobs" ON public.jobs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = jobs.tenant_id AND user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_products_tenant_id ON public.products(tenant_id);
CREATE INDEX idx_products_created_by ON public.products(created_by);
CREATE INDEX idx_jobs_tenant_id ON public.jobs(tenant_id);
CREATE INDEX idx_jobs_created_by ON public.jobs(created_by);
CREATE INDEX idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_user_id ON public.tenant_members(user_id);
CREATE INDEX idx_tenants_owner_id ON public.tenants(owner_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    company_name = COALESCE(EXCLUDED.company_name, users.company_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert sample tenant for testing (optional)
-- INSERT INTO public.tenants (name, slug, owner_id) VALUES ('Demo Company', 'demo', 'your-user-id-here');
