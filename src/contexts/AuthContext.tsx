import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User as AppUser, Tenant as AppTenant } from '../types';

interface AuthContextType {
  user: AppUser | null;
  tenant: AppTenant | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<{ error: any }>;
  signUp: (email: string, fullName: string, companyName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createTenant: (name: string, slug: string) => Promise<{ error: any }>;
  joinTenant: (slug: string) => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [tenant, setTenant] = useState<AppTenant | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserAndTenant(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      setSession(session);
      if (session?.user) {
        await fetchUserAndTenant(session.user);
      } else {
        console.log('No session, clearing user and tenant');
        setUser(null);
        setTenant(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserAndTenant = async (supabaseUser: User) => {
    try {
      console.log('Fetching user and tenant data for:', supabaseUser.email);
      
      // Fetch user profile
      let userData;
      const { data: existingUserData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (userError) {
        console.log('User profile error:', userError.message);
        
        // If user profile doesn't exist, create it
        if (userError.code === 'PGRST116') {
          console.log('Creating user profile...');
          const { data: newUserData, error: createError } = await supabase
            .from('users')
            .insert([
              {
                id: supabaseUser.id,
                email: supabaseUser.email!,
                full_name: supabaseUser.user_metadata?.full_name || null,
                company_name: supabaseUser.user_metadata?.company_name || null,
                subscription_tier: 'free',
                subscription_status: 'active',
              },
            ])
            .select()
            .single();

          if (createError) {
            console.error('Error creating user profile:', createError);
            throw createError;
          }
          
          userData = newUserData;
          console.log('User profile created successfully');
        } else {
          throw userError;
        }
      } else {
        userData = existingUserData;
        console.log('User profile found');
      }

      const appUser: AppUser = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        company_name: userData.company_name,
        subscription_tier: userData.subscription_tier,
        subscription_status: userData.subscription_status,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };

      setUser(appUser);
      console.log('User profile set:', appUser.email);

      // Fetch user's primary tenant
      const { data: memberData, error: memberError } = await supabase
        .from('tenant_members')
        .select(`
          tenant_id,
          role,
          tenants (
            id,
            name,
            slug,
            owner_id,
            settings,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', supabaseUser.id)
        .order('role', { ascending: false }) // Owner first
        .limit(1)
        .single();

      if (memberError) {
        console.log('User has no tenant yet:', memberError.message);
        // User has no tenant, that's okay
        setTenant(null);
      } else {
        console.log('Member data:', memberData);
        console.log('Tenants object:', memberData.tenants);
        
        // Type assertion to fix TypeScript confusion
        const tenantData = memberData.tenants as any;
        
        const appTenant: AppTenant = {
          id: tenantData.id,
          name: tenantData.name,
          slug: tenantData.slug,
          owner_id: tenantData.owner_id,
          settings: tenantData.settings,
          created_at: tenantData.created_at,
          updated_at: tenantData.updated_at,
        };
        setTenant(appTenant);
        console.log('Tenant set:', appTenant.name);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Don't throw here, just log the error
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, fullName: string, companyName: string) => {
    try {
      // First, sign up with magic link
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      });

      if (signUpError) return { error: signUpError };

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTenant(null);
  };

  const createTenant = async (name: string, slug: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Create tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .insert([
          {
            name,
            slug,
            owner_id: user.id,
          },
        ])
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('tenant_members')
        .insert([
          {
            tenant_id: tenantData.id,
            user_id: user.id,
            role: 'owner',
          },
        ]);

      if (memberError) throw memberError;

      // Refresh user data
      await refreshUser();

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const joinTenant = async (slug: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Get tenant by slug
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', slug)
        .single();

      if (tenantError) throw tenantError;

      // Add user as member
      const { error: memberError } = await supabase
        .from('tenant_members')
        .insert([
          {
            tenant_id: tenantData.id,
            user_id: user.id,
            role: 'member',
          },
        ]);

      if (memberError) throw memberError;

      // Refresh user data
      await refreshUser();

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      await fetchUserAndTenant(session.user);
    }
  };

  const value: AuthContextType = {
    user,
    tenant,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    createTenant,
    joinTenant,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
