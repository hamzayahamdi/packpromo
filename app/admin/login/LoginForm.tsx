'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid password');
      }

      // Set cookie and redirect
      Cookies.set('adminAuthenticated', 'true', { 
        expires: 7, // 7 days
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      router.refresh();
      router.push('/admin/products');
    } catch (err) {
      setError('Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label 
          htmlFor="password" 
          className="block text-sm font-medium text-white/80 mb-2"
        >
          Admin Password
        </label>
        <div className="relative">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                     focus:ring-2 focus:ring-orange-500/50 focus:border-transparent 
                     transition-all duration-200 backdrop-blur-sm text-white
                     placeholder:text-white/30"
            placeholder="Enter admin password"
            required
            disabled={isLoading}
          />
        </div>
      </div>
      {error && (
        <p className="text-orange-400 text-sm font-medium flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 
                 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 
                 font-medium shadow-lg hover:shadow-xl hover:shadow-orange-500/20
                 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-[#0f172a]
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Logging in...' : 'Access Dashboard'}
      </button>
    </form>
  );
} 