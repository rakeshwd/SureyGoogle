import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { KeyIcon } from './icons';

interface ResetPasswordPageProps {
  token: string;
  onResetSuccess: () => void;
  onInvalidToken: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ token, onResetSuccess, onInvalidToken }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Note: In a real app, you might want to verify the token on component mount
  // and show a loading/invalid state before the user even sees the form.
  // For this demo, we verify it upon submission.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setError('');
    setLoading(true);

    const result = await api.resetPassword(token, password);

    setLoading(false);
    if (result.success) {
      onResetSuccess();
    } else {
      if (result.error === 'invalid_token' || result.error === 'expired_token') {
        onInvalidToken();
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
            <KeyIcon className="h-10 w-10 mx-auto text-teal-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Set a New Password</h2>
        </div>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-700 dark:border-slate-600"
            required
            aria-label="New Password"
          />
          <input
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-700 dark:border-slate-600"
            required
            aria-label="Confirm New Password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;