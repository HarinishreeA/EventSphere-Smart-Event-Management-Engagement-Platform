import React, { useState } from 'react';
import { Calendar, User, LogOut, Shield, BookmarkCheck, PlusCircle, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ activeTab, setActiveTab, onOpenCreateModal }) => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-brand-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
                  Campus Events
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Event Management Hub</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Event Catalog
            </button>

            {isStudent && (
              <button
                onClick={() => setActiveTab('my-events')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'my-events'
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BookmarkCheck className="w-4 h-4" />
                My RSVPs
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Portal
              </button>
            )}
          </nav>

          {/* Action & User Profile Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <PlusCircle className="w-4 h-4" />
                Create Event
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-100">{user.name}</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isAdmin ? 'bg-purple-400' : 'bg-brand-400'
                      }`}
                    />
                    <span className="text-xs text-slate-400 capitalize font-medium">
                      {user.role} {user.department ? `• ${user.department}` : ''}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-4 py-2.5 text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-600/25 transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
              activeTab === 'catalog' ? 'bg-brand-600 text-white' : 'text-slate-300 bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            Event Catalog
          </button>

          {isStudent && (
            <button
              onClick={() => { setActiveTab('my-events'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
                activeTab === 'my-events' ? 'bg-brand-600 text-white' : 'text-slate-300 bg-slate-900/60'
              }`}
            >
              <BookmarkCheck className="w-5 h-5" />
              My RSVPs
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
                activeTab === 'admin' ? 'bg-purple-600 text-white' : 'text-slate-300 bg-slate-900/60'
              }`}
            >
              <Shield className="w-5 h-5" />
              Admin Portal
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => { onOpenCreateModal(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-emerald-600 text-white shadow-lg"
            >
              <PlusCircle className="w-5 h-5" />
              Create Event
            </button>
          )}

          {user ? (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role} • {user.email}</p>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="px-3 py-2 text-sm font-semibold text-rose-400 bg-rose-500/10 rounded-xl"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }}
                className="py-2.5 text-center font-semibold text-slate-200 bg-slate-900 rounded-xl border border-slate-800"
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('register'); setMobileMenuOpen(false); }}
                className="py-2.5 text-center font-bold bg-brand-600 text-white rounded-xl"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
