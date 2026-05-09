import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegistering) {
        await registerWithEmail(name, email, password);
      } else {
        await loginWithEmail(email, password);
      }
      // On success, AuthRedirect will automatically navigate once auth state updates.
      // We don't set loading to false here to keep the UI in a loading state until unmount.
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('auth/configuration-not-found')) {
        setError('Google Sign-In is not enabled. Please enable the Google provider in your Firebase Authentication console.');
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('auth/unauthorized-domain')) {
        setError('This domain is not authorized for OAuth operations. Please add this app\'s URL to the Authorized Domains list in your Firebase Authentication settings.');
      } else {
        setError(err.message || 'Google Sign-In failed or was cancelled.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="glass w-full max-w-md rounded-2xl p-8 relative z-10 animate-fade-in shadow-xl border border-glass-border">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <Logo className="w-20 h-20" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">E-Sevai Smart ✨</h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to access your services portal 🚪</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="text-sm font-medium ml-1">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium ml-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full relative group bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-xl flex justify-center items-center font-medium transition-all"
          >
            {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In with Email'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-[1px] bg-border flex-1"></div>
          <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">OR</span>
          <div className="h-[1px] bg-border flex-1"></div>
        </div>

        <div className="mt-6">
          <button 
            type="button"
            onClick={handleGoogleAuth}
            className="w-full relative group glass border border-border hover:border-primary/40 p-3 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-black/5 dark:hover:bg-white/5"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-semibold text-foreground">Sign in with Google</span>
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="ml-2 font-medium text-primary hover:underline"
          >
            {isRegistering ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
