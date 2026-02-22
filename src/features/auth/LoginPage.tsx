import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { API_URL } from '@/config/env';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      login(data.user);
      navigate('/');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Sign in to your ByteCode account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-bg-secondary p-8">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="login" className="block text-sm font-medium text-text">
              Username or Email
            </label>
            <input
              id="login"
              type="text"
              required
              value={form.login}
              onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Enter username or email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-text">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-text-muted">
            Don't have an account?{' '}
            <NavLink to="/signup" className="font-medium text-accent hover:underline">
              Sign up
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
}
