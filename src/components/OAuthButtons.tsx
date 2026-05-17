import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || '/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface OAuthButtonsProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onSuccess, redirectTo = '/' }) => {
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();

  const finishGoogleLogin = React.useCallback((data: any) => {
    if (data.success && data.token && data.user) {
      completeOAuthLogin(data.token, data.user);
      if (onSuccess) onSuccess();
      else navigate(redirectTo, { replace: true });
      return;
    }

    console.error('[Google OAuth] Server error:', data);
    toast.error(data.message || 'Google sign-in failed. Please try again.');
  }, [completeOAuthLogin, navigate, onSuccess, redirectTo]);

  const handleGoogleSuccess = async (tokenResponse: any) => {
    try {
      const res = await fetch(`${API}/auth/oauth/google/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenResponse.access_token }),
      });
      
      const data = await res.json();
      
      finishGoogleLogin(data);
    } catch (error: any) {
      console.error('[Google OAuth] Network error:', error);
      toast.error(`Sign-in error: ${error?.message || 'Could not reach server'}`);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in cancelled or unavailable'),
  });

  // Initialize Google One Tap
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.google && GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            try {
              const res = await fetch(`${API}/auth/oauth/google/verify-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
              });
              
              const data = await res.json();
              
              finishGoogleLogin(data);
            } catch (error: any) {
              console.error('Google One Tap error:', error);
              toast.error(error?.message || 'Google One Tap sign-in failed');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Show One Tap prompt automatically
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error('Google One Tap init error:', error);
      }
    }
  }, [finishGoogleLogin]);

  // Handle Google Sign-In button with account chooser
  const handleGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID and restart the app.');
      return;
    }

    if (typeof window !== 'undefined' && window.google && GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One Tap is not displayed, use OAuth flow
            googleLogin();
          }
        });
      } catch (error) {
        // Fallback to OAuth flow
        googleLogin();
      }
    } else {
      // Fallback to OAuth flow
      googleLogin();
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full bg-ivory/5 hover:bg-ivory/10 text-ivory border border-ivory/20 px-4 py-3 flex items-center justify-center gap-3 transition-colors rounded-sm"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        <span className="font-sans text-sm font-medium">Continue with Google</span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ivory/10"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-obsidian px-2 text-ivory/30 font-sans uppercase tracking-wider">Or</span>
        </div>
      </div>
    </div>
  );
};
