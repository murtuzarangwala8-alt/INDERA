import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || '/api';

interface OAuthButtonsProps {
  onSuccess?: () => void;
}

// Declare AppleID type
declare global {
  interface Window {
    AppleID: any;
  }
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onSuccess }) => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse: any) => {
    try {
      const res = await fetch(`${API}/auth/oauth/google/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenResponse.access_token }),
      });
      
      const data = await res.json();
      
      if (data.success && data.token) {
        localStorage.setItem('indera_token', data.token);
        toast.success(`Welcome, ${data.user.firstName}!`);
        if (onSuccess) onSuccess();
        else navigate('/');
        window.location.reload();
      } else {
        toast.error(data.message || 'Google sign-in failed');
      }
    } catch (error) {
      toast.error('Google sign-in failed. Please try again.');
    }
  };

  const handleAppleSuccess = async (response: any) => {
    try {
      const res = await fetch(`${API}/auth/oauth/apple/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityToken: response.authorization.id_token,
          user: response.user,
        }),
      });
      
      const data = await res.json();
      
      if (data.success && data.token) {
        localStorage.setItem('indera_token', data.token);
        toast.success(`Welcome, ${data.user.firstName}!`);
        if (onSuccess) onSuccess();
        else navigate('/');
        window.location.reload();
      } else {
        toast.error(data.message || 'Apple sign-in failed');
      }
    } catch (error) {
      toast.error('Apple sign-in failed. Please try again.');
    }
  };

  const handleAppleLogin = () => {
    if (typeof window !== 'undefined' && window.AppleID) {
      window.AppleID.auth.signIn();
    } else {
      toast.error('Apple Sign-In not available');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in cancelled'),
  });

  // Listen for Apple Sign-In events
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('AppleIDSignInOnSuccess', handleAppleSuccess);
      document.addEventListener('AppleIDSignInOnFailure', () => {
        toast.error('Apple sign-in failed');
      });

      return () => {
        document.removeEventListener('AppleIDSignInOnSuccess', handleAppleSuccess);
        document.removeEventListener('AppleIDSignInOnFailure', () => {});
      };
    }
  }, []);

  return (
    <div className="space-y-3 mb-6">
      {/* Google Button */}
      <button
        type="button"
        onClick={() => googleLogin()}
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

      {/* Apple Button */}
      <button
        type="button"
        onClick={handleAppleLogin}
        className="w-full bg-obsidian hover:bg-charcoal text-ivory border border-ivory/20 px-4 py-3 flex items-center justify-center gap-3 transition-colors rounded-sm"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <path d="M14.94 5.19A4.38 4.38 0 0 0 13 6.5a4.44 4.44 0 0 1 1.06 3.24 4.5 4.5 0 0 1-2.73 4.09 6.23 6.23 0 0 1-1.17 2.42c-.56.75-1.14 1.5-2.05 1.51s-1.21-.48-2.26-.48-1.38.47-2.25.49-1.42-.7-2-1.47a13.79 13.79 0 0 1-2.66-7.58A6 6 0 0 1 0 5.82a4.07 4.07 0 0 1 3.47-2.07c.91 0 1.67.3 2.22.3s1.39-.31 2.35-.31a3.89 3.89 0 0 1 3.27 1.69 4 4 0 0 0-1.93 3.36 4.1 4.1 0 0 0 2.46 3.74 9.06 9.06 0 0 1-.9 1.86zM12.05 2.5a4.33 4.33 0 0 1-1 2.8 3.61 3.61 0 0 1-2.9 1.37 4.18 4.18 0 0 1 1-2.71 4.46 4.46 0 0 1 2.9-1.46z"/>
        </svg>
        <span className="font-sans text-sm font-medium">Continue with Apple</span>
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
