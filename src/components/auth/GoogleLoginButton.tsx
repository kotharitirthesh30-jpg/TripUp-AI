import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { LogIn, LogOut, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface GoogleLoginButtonProps {
  variant?: 'compact' | 'full' | 'navbar';
  className?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  variant = 'full',
  className = '',
}) => {
  const { authUser, authLoading, signInWithGoogle, signOutUser, userProfile } = useTravel();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('popup-closed-by-user')) {
        setErrorMessage('Sign-in cancelled or failed. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Sign-out failed', err);
    }
  };

  // Google SVG Icon
  const GoogleIcon = () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );

  if (authLoading) {
    return (
      <div className={`flex items-center gap-2 text-xs text-[#7ea08f] ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Authenticating...</span>
      </div>
    );
  }

  // Navbar variant
  if (variant === 'navbar') {
    if (authUser) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#14201a] border border-[#2d4d3a] text-xs">
            {authUser.photoURL ? (
              <img
                src={authUser.photoURL}
                alt={authUser.displayName || 'Traveler'}
                className="w-5 h-5 rounded-full object-cover border border-[#52b788]/60"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#2e5d4b] text-white flex items-center justify-center font-bold text-[10px]">
                {(authUser.displayName || userProfile.name).charAt(0)}
              </div>
            )}
            <span className="text-[#d8e6de] font-semibold hidden md:inline truncate max-w-[110px]">
              {authUser.displayName?.split(' ')[0] || userProfile.name.split(' ')[0]}
            </span>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="ml-1 p-1 rounded-md text-[#8aa395] hover:text-[#e67373] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        onClick={handleSignIn}
        disabled={isLoggingIn}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14201a] hover:bg-[#1f3128] border border-[#2b4437] hover:border-[#52b788]/60 text-white font-medium text-xs shadow-sm transition-all ${className}`}
      >
        {isLoggingIn ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#52b788]" /> : <GoogleIcon />}
        <span>Sign In</span>
      </button>
    );
  }

  // Full / card variant
  if (authUser) {
    return (
      <div className={`p-4 bg-[#14201a] border border-[#2b4437] rounded-xl space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {authUser.photoURL ? (
              <img
                src={authUser.photoURL}
                alt={authUser.displayName || 'Traveler'}
                className="w-10 h-10 rounded-full object-cover border border-[#52b788]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#2e5d4b] text-white flex items-center justify-center font-bold text-sm">
                {(authUser.displayName || userProfile.name).charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>{authUser.displayName || userProfile.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1e3427] text-[#52b788] border border-[#2d4d3a] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#52b788]" />
                  Google Verified
                </span>
              </div>
              <div className="text-[11px] text-[#8aa395]">{authUser.email || userProfile.email}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#201818] hover:bg-[#2e1d1d] border border-[#4d2d2d] text-[#e89090] text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        onClick={handleSignIn}
        disabled={isLoggingIn}
        className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-white hover:bg-[#f2f4f3] text-[#1f2937] font-semibold text-xs shadow-md transition-all border border-gray-200"
      >
        {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin text-[#1f2937]" /> : <GoogleIcon />}
        <span>Sign in with Google</span>
      </button>
      {errorMessage && (
        <p className="text-[11px] text-[#e89090] bg-[#2a1717] px-3 py-1.5 rounded-lg border border-[#4d2d2d]">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
