-- Safe Migration Script - Handles Existing Tables
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check and create users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
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
        RAISE NOTICE 'Created users table';
    ELSE
        RAISE NOTICE 'Users table already exists';
    END IF;
END $$;

-- Check and create tenants table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenants') THEN
        CREATE TABLE public.tenants (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            settings JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created tenants table';
    ELSE
        RAISE NOTICE 'Tenants table already exists';
    END IF;
END $$;

-- Check and create tenant_members table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenant_members') THEN
        CREATE TABLE public.tenant_members (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
            user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
            role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(tenant_id, user_id)
        );
        RAISE NOTICE 'Created tenant_members table';
    ELSE
        RAISE NOTICE 'Tenant_members table already exists';
    END IF;
END $$;

-- Check if products table exists and add missing columns
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        -- Add tenant_id column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tenant_id') THEN
            ALTER TABLE public.products ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added tenant_id column to products table';
        END IF;
        
        -- Add created_by column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_by') THEN
            ALTER TABLE public.products ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added created_by column to products table';
        END IF;
        
        -- Add created_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
            ALTER TABLE public.products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added created_at column to products table';
        END IF;
    ELSE
        -- Create products table if it doesn't exist
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
        RAISE NOTICE 'Created products table';
    END IF;
END $$;

-- Check if jobs table exists and add missing columns
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'jobs') THEN
        -- Add tenant_id column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'tenant_id') THEN
            ALTER TABLE public.jobs ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added tenant_id column to jobs table';
        END IF;
        
        -- Add created_by column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'created_by') THEN
            ALTER TABLE public.jobs ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added created_by column to jobs table';
        END IF;
        
        -- Add created_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'created_at') THEN
            ALTER TABLE public.jobs ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added created_at column to jobs table';
        END IF;
    ELSE
        -- Create jobs table if it doesn't exist
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
        RAISE NOTICE 'Created jobs table';
    END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow new user profile creation" ON public.users;

DROP POLICY IF EXISTS "tenants_select_policy" ON public.tenants;
DROP POLICY IF EXISTS "tenants_insert_policy" ON public.tenants;
DROP POLICY IF EXISTS "tenants_update_policy" ON public.tenants;
DROP POLICY IF EXISTS "tenants_delete_policy" ON public.tenants;

DROP POLICY IF EXISTS "tenant_members_select_policy" ON public.tenant_members;
DROP POLICY IF EXISTS "tenant_members_insert_policy" ON public.tenant_members;
DROP POLICY IF EXISTS "tenant_members_update_policy" ON public.tenant_members;
DROP POLICY IF EXISTS "tenant_members_delete_policy" ON public.tenant_members;

-- Create RLS policies for users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow new user profile creation" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for tenants
CREATE POLICY "tenants_select_policy" ON public.tenants FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "tenants_insert_policy" ON public.tenants FOR INSERT WITH CHECK (
  owner_id = auth.uid()
);

CREATE POLICY "tenants_update_policy" ON public.tenants FOR UPDATE USING (
  owner_id = auth.uid()
);

CREATE POLICY "tenants_delete_policy" ON public.tenants FOR DELETE USING (
  owner_id = auth.uid()
);

-- Create RLS policies for tenant_members
CREATE POLICY "tenant_members_select_policy" ON public.tenant_members FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = tenant_members.tenant_id AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "tenant_members_insert_policy" ON public.tenant_members FOR INSERT WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = tenant_members.tenant_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "tenant_members_update_policy" ON public.tenant_members FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = tenant_members.tenant_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "tenant_members_delete_policy" ON public.tenant_members FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = tenant_members.tenant_id AND owner_id = auth.uid()
  )
);

-- Create RLS policies for products
CREATE POLICY "products_select_policy" ON public.products FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = products.tenant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "products_insert_policy" ON public.products FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = products.tenant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "products_update_policy" ON public.products FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = products.tenant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "products_delete_policy" ON public.products FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = products.tenant_id AND user_id = auth.uid()
  )
);

-- Create RLS policies for jobs
CREATE POLICY "jobs_select_policy" ON public.jobs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = jobs.tenant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "jobs_insert_policy" ON public.jobs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = jobs.tenant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "jobs_update_policy" ON public.jobs FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = jobs.tenant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "jobs_delete_policy" ON public.jobs FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = jobs.tenant_id AND user_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_id ON public.jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON public.jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON public.tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Show final status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

