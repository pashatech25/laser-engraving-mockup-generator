import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback...');
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!session?.user) {
          console.log('No session found, checking for auth params...');
          
          // Check if we have auth parameters in the URL
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('Found auth tokens in URL, setting session...');
            
            // Set the session manually
            const { data: { session: newSession }, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (setSessionError) {
              console.error('Error setting session:', setSessionError);
              throw setSessionError;
            }
            
            if (newSession?.user) {
              console.log('Session set successfully, user:', newSession.user.email);
              await handleUserProfile(newSession.user);
              return;
            }
          }
          
          throw new Error('No valid session found');
        }

        console.log('Session found, user:', session.user.email);
        await handleUserProfile(session.user);
        
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        
        // Redirect to auth page after error
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    const handleUserProfile = async (user: any) => {
      try {
        console.log('Handling user profile for:', user.email);
        
        // Check if user profile exists
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          console.log('User profile does not exist, creating...');
          
          // User profile doesn't exist, create it
          const { error: createError } = await supabase
            .from('users')
            .insert([
              {
                id: user.id,
                email: user.email!,
                full_name: user.user_metadata?.full_name || null,
                company_name: user.user_metadata?.company_name || null,
                subscription_tier: 'free',
                subscription_status: 'active',
              },
            ]);

          if (createError) {
            console.error('Error creating user profile:', createError);
            // Continue anyway - the trigger function might have handled it
          } else {
            console.log('User profile created successfully');
          }
        } else if (profileError) {
          console.error('Error checking user profile:', profileError);
          // Continue anyway
        } else {
          console.log('User profile already exists');
        }

        // Refresh user data in context
        console.log('Refreshing user data...');
        await refreshUser();
        
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
          navigate('/dashboard', { replace: true });
        }, 1500);
        
      } catch (error: any) {
        console.error('Error handling user profile:', error);
        setStatus('error');
        setMessage('Error setting up user profile');
        
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, refreshUser, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Authenticating...</h1>
              <p className="text-gray-600">Please wait while we verify your authentication</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>This may take a few moments...</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
