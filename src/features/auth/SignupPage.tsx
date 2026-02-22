import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { API_URL } from '@/config/env';

export function SignupPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
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
            Create an account
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Join ByteCode to start solving problems
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
            <label htmlFor="username" className="block text-sm font-medium text-text">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              maxLength={50}
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Choose a username"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Enter your email"
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
              minLength={6}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder-text-muted outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Min 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-text-muted">
            Already have an account?{' '}
            <NavLink to="/login" className="font-medium text-accent hover:underline">
              Sign in
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
}
