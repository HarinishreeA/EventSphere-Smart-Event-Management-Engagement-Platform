import React, { useState } from 'react';
import { LogIn, Mail, Lock, Shield, User, Sparkles, Eye, EyeOff, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ onNavigateToRegister, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setEmail('admin@campus.edu');
    setPassword('admin123');
    setError('');
    setLoading(true);
    try {
      await login('admin@campus.edu', 'admin123');
      onSuccess();
    } catch (err) {
      setError('Please run seed script `npm run seed` in server folder to generate demo accounts!');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudent = async () => {
    setEmail('student1@campus.edu');
    setPassword('student123');
    setError('');
    setLoading(true);
    try {
      await login('student1@campus.edu', 'student123');
      onSuccess();
    } catch (err) {
      setError('Please run seed script `npm run seed` in server folder to generate demo accounts!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10">
      <div className="surface-card rounded-2xl p-7 sm:p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#09090B] text-[#A3E635] mx-auto flex items-center justify-center border border-[#27272A] shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#FAFAFA]">Welcome to EventSphere</h2>
          <p className="text-xs text-[#A1A1AA] font-medium">Sign in to manage your RSVPs, event passes, and catalog</p>
        </div>

        {/* Demo Login Shortcuts */}
        <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
          <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" /> Instant Demo Sign-In
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] border border-[#27272A] transition-colors flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-[#A3E635]" /> Admin Demo
            </button>
            <button
              type="button"
              onClick={handleDemoStudent}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] border border-[#27272A] transition-colors flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#A3E635]" /> Student Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors p-0.5 focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B] shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#27272A]">
          <p className="text-xs text-[#A1A1AA]">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToRegister}
              className="font-bold text-[#A3E635] hover:underline ml-1"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
