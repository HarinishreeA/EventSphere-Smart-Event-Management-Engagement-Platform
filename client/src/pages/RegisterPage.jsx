import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Building, Shield, Hash, Eye, EyeOff, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const departments = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Management & Business',
  'General / Other',
];

const RegisterPage = ({ onNavigateToLogin, onSuccess }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState(departments[0]);
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role,
        department,
        studentId,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
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
          <h2 className="text-2xl font-extrabold text-[#FAFAFA]">Join EventSphere</h2>
          <p className="text-xs text-[#A1A1AA] font-medium">Create your campus profile to RSVP & organize events</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Account Role *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'student'
                    ? 'bg-[#A3E635] text-[#09090B] font-bold shadow-sm'
                    : 'bg-[#09090B] text-[#A1A1AA] border border-[#27272A] hover:text-[#FAFAFA]'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Student
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'admin'
                    ? 'bg-[#A3E635] text-[#09090B] font-bold shadow-sm'
                    : 'bg-[#09090B] text-[#A1A1AA] border border-[#27272A] hover:text-[#FAFAFA]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Admin / Faculty
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@campus.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Department *
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-[#18181B] text-[#FAFAFA]">{d}</option>
                ))}
              </select>
            </div>
          </div>

          {role === 'student' && (
            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
                Student ID / Roll No (Optional)
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. CS2026-042"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B] shadow-sm transition-all active:scale-95"
          >
            {loading ? 'Creating Account...' : 'Register Profile'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#27272A]">
          <p className="text-xs text-[#A1A1AA]">
            Already registered?{' '}
            <button
              onClick={onNavigateToLogin}
              className="font-bold text-[#A3E635] hover:underline ml-1"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
