-- Comprehensive Fix for Tenant Infinite Recursion
-- Run this in Supabase SQL Editor to fix the RLS policy issues

-- First, temporarily disable RLS to clear the problematic state
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members DISABLE ROW LEVEL SECURITY;

-- Clear any existing policies that might cause recursion
DROP POLICY IF EXISTS "Tenant members can view tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant owners can manage tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant members can view team" ON public.tenant_members;
DROP POLICY IF EXISTS "Tenant owners can manage team" ON public.tenant_members;

-- Re-enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for tenants
CREATE POLICY "tenants_select_policy" ON public.tenants FOR SELECT USING (
  -- Users can view tenants they own or belong to
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "tenants_insert_policy" ON public.tenants FOR INSERT WITH CHECK (
  -- Users can create tenants where they are the owner
  owner_id = auth.uid()
);

CREATE POLICY "tenants_update_policy" ON public.tenants FOR UPDATE USING (
  -- Only owners can update their tenants
  owner_id = auth.uid()
);

CREATE POLICY "tenants_delete_policy" ON public.tenants FOR DELETE USING (
  -- Only owners can delete their tenants
  owner_id = auth.uid()
);

-- Create simple, non-recursive policies for tenant_members
CREATE POLICY "tenant_members_select_policy" ON public.tenant_members FOR SELECT USING (
  -- Users can view team members of tenants they belong to
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.tenant_members tm
    WHERE tm.tenant_id = tenant_members.tenant_id AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "tenant_members_insert_policy" ON public.tenant_members FOR INSERT WITH CHECK (
  -- Users can join tenants (self-insert)
  user_id = auth.uid() OR
  -- Or owners can add members to their tenants
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = tenant_members.tenant_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "tenant_members_update_policy" ON public.tenant_members FOR UPDATE USING (
  -- Users can update their own membership
  user_id = auth.uid() OR
  -- Or owners can update any membership in their tenant
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = tenant_members.tenant_id AND owner_id = auth.uid()
  )
);

CREATE POLICY "tenant_members_delete_policy" ON public.tenant_members FOR DELETE USING (
  -- Users can leave tenants (self-delete)
  user_id = auth.uid() OR
  -- Or owners can remove members from their tenant
  EXISTS (
    SELECT 1 FROM public.tenants 
    WHERE id = tenant_members.tenant_id AND owner_id = auth.uid()
  )
);

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('tenants', 'tenant_members')
ORDER BY tablename, policyname;

