import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from '../services/firebase';

interface LoginViewProps {
  onLoginSuccess: (email: string, uid: string) => void;
  onNavigateRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onNavigateRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Sign-in with popup
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      onLoginSuccess(user.email || 'user@warrantyvault.com', user.uid);
    } catch (err: unknown) {
      console.warn('Google sign-in popup error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Google sign-in was interrupted. You can also sign in with email.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Instant Guest / Demo sign-in
  const handleGuestSignIn = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await signInAnonymously(auth);
      onLoginSuccess('guest@warrantyvault.com', res.user.uid);
    } catch {
      // If anonymous auth is not enabled in Firebase Console, auto-create a demo account with Email/Password
      try {
        const demoRes = await signInWithEmailAndPassword(auth, 'demo@warrantyvault.com', 'DemoPass123!');
        onLoginSuccess('demo@warrantyvault.com', demoRes.user.uid);
      } catch {
        try {
          const newDemo = await createUserWithEmailAndPassword(auth, 'demo@warrantyvault.com', 'DemoPass123!');
          onLoginSuccess('demo@warrantyvault.com', newDemo.user.uid);
        } catch (demoErr: unknown) {
          const msg = demoErr instanceof Error ? demoErr.message : 'Could not create demo account';
          setErrorMessage(msg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      onLoginSuccess(res.user.email || trimmedEmail, res.user.uid);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      // If user does not exist yet, attempt automatic creation so users don't get stuck
      if (
        firebaseError.code === 'auth/user-not-found' ||
        firebaseError.code === 'auth/invalid-credential'
      ) {
        try {
          const newRes = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          onLoginSuccess(newRes.user.email || trimmedEmail, newRes.user.uid);
          return;
        } catch (createErr: unknown) {
          const cError = createErr as { code?: string; message?: string };
          setErrorMessage(cError.message || 'Incorrect credentials or account not found.');
        }
      } else {
        setErrorMessage(firebaseError.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
        {/* Brand header matching activity_login.xml */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#263A5B]/10 text-[#263A5B] mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#263A5B] tracking-tight">
            WarrantyVault
          </h1>
          <p className="text-sm text-[#777777] mt-1">
            Your products. Your warranties. One place.
          </p>
        </div>

        {/* Cloud Firestore connected badge */}
        <div className="mb-6 flex items-center justify-center gap-1.5 py-1 px-3 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-semibold text-amber-900 w-fit mx-auto">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Cloud Firestore Powered</span>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-[#C62828] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google 1-Click Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-bold text-sm border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase">Or</span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* Email / Password Form matching original Android UI */}
        <form onSubmit={handleEmailLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6C707A] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-[#222222] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263A5B]/20 focus:border-[#263A5B] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6C707A] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-[#222222] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#263A5B]/20 focus:border-[#263A5B] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#263A5B] hover:bg-[#1b2c47] text-white rounded-xl font-bold text-sm shadow-md shadow-[#263A5B]/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Signing in...' : 'Sign In with Email'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Guest Demo Button */}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>⚡ Instant Guest / Demo Mode</span>
          </button>
        </div>

        {/* Register navigation link */}
        <div className="mt-5 text-center">
          <button
            onClick={onNavigateRegister}
            className="text-sm font-semibold text-[#263A5B] hover:underline cursor-pointer"
          >
            New user? Create an account
          </button>
        </div>
      </div>
    </div>
  );
};
