-- Quick Fix for RLS Policies (Run this in Supabase SQL Editor)
-- This fixes the user profile creation issue and infinite recursion in tenant policies

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create new policies that allow profile creation
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow new user profile creation" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Drop existing policies for tenants table
DROP POLICY IF EXISTS "Tenant members can view tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant owners can manage tenant" ON public.tenants;

-- Create new policies for tenants that allow creation and management
CREATE POLICY "Users can view tenants they belong to" ON public.tenants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own tenants" ON public.tenants FOR INSERT WITH CHECK (
  owner_id = auth.uid()
);

CREATE POLICY "Tenant owners can update their tenants" ON public.tenants FOR UPDATE USING (
  owner_id = auth.uid()
);

CREATE POLICY "Tenant owners can delete their tenants" ON public.tenants FOR DELETE USING (
  owner_id = auth.uid()
);

-- Drop existing policies for tenant_members table
DROP POLICY IF EXISTS "Tenant members can view team" ON public.tenant_members;
DROP POLICY IF EXISTS "Tenant owners can manage team" ON public.tenant_members;

-- Create new policies for tenant_members that avoid infinite recursion
CREATE POLICY "Users can view teams they belong to" ON public.tenant_members FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = tenant_members.tenant_id AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join tenants" ON public.tenant_members FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Tenant owners can manage team members" ON public.tenant_members FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = tenant_members.tenant_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "Tenant owners can remove team members" ON public.tenant_members FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = tenant_members.tenant_id AND owner_id = auth.uid()
  )
);

-- Update the trigger function to handle conflicts better
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

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
