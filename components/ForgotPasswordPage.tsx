import React, { useState } from 'react';
import * as api from '../services/api';
import { EnvelopeIcon } from './icons';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await api.requestPasswordReset(email);
    // We always show success to prevent email enumeration
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
        {submitted ? (
          <div className="text-center">
            <EnvelopeIcon className="h-12 w-12 mx-auto text-green-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Check your inbox</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              If an account with that email exists, we have sent a password reset link. (For this demo, the link is printed in the browser console).
            </p>
            <button
                onClick={onNavigateToLogin}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
                Back to Login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Forgot Password</h2>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">Enter your email and we'll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-700 dark:border-slate-600"
                required
                aria-label="Email Address"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              Remember your password?{' '}
              <button onClick={onNavigateToLogin} className="font-medium text-teal-500 hover:text-teal-400 dark:text-teal-400 dark:hover:text-teal-300">
                Login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;