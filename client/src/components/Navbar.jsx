import React, { useState } from 'react';
import { Layers, Calendar, LogOut, Shield, BookmarkCheck, Plus, Sparkles, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ activeTab, setActiveTab, onOpenCreateModal }) => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 nav-blur bg-[#09090B]/90 border-b border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* EventSphere Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none" 
            onClick={() => setActiveTab('catalog')}
          >
            <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#A3E635] shadow-sm group-hover:border-[#A3E635]/40 transition-all duration-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-[#FAFAFA] group-hover:text-white transition-colors">
                  Event<span className="text-[#A3E635]">Sphere</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#18181B] text-[#A3E635] border border-[#27272A]">
                  Platform
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] font-medium hidden sm:block">Smart Event & Engagement Hub</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#18181B] p-1.5 rounded-xl border border-[#27272A]">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'catalog'
                  ? 'bg-[#27272A] text-[#FAFAFA] shadow-sm border border-[#3F3F46]'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#A3E635]" />
              Explore Events
            </button>

            {isStudent && (
              <button
                onClick={() => setActiveTab('my-events')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'my-events'
                    ? 'bg-[#27272A] text-[#FAFAFA] shadow-sm border border-[#3F3F46]'
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]/50'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-[#A3E635]" />
                My Passes
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'admin'
                    ? 'bg-[#27272A] text-[#FAFAFA] shadow-sm border border-[#3F3F46]'
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]/50'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#A3E635]" />
                Admin Portal
              </button>
            )}
          </nav>

          {/* Action & User Profile Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={onOpenCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B] transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-[#27272A]">
                <div className="text-right">
                  <p className="text-xs font-bold text-[#FAFAFA] leading-tight">{user.name}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
                    <span className="text-[11px] text-[#A1A1AA] capitalize font-medium">
                      {user.role} {user.department ? `• ${user.department}` : ''}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-[#A1A1AA] hover:text-rose-400 hover:bg-[#18181B] rounded-lg transition-colors border border-[#27272A]"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B] rounded-lg transition-colors border border-transparent hover:border-[#27272A]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-4 py-2 text-xs font-bold bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B] rounded-lg transition-all shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#A1A1AA] hover:text-[#FAFAFA] rounded-lg bg-[#18181B] border border-[#27272A]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#27272A] bg-[#09090B]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          <button
            onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'catalog' 
                ? 'bg-[#18181B] text-[#A3E635] border border-[#27272A]' 
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#A3E635]" />
              Explore Events
            </span>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>

          {isStudent && (
            <button
              onClick={() => { setActiveTab('my-events'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold ${
                activeTab === 'my-events' 
                  ? 'bg-[#18181B] text-[#A3E635] border border-[#27272A]' 
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BookmarkCheck className="w-4 h-4 text-[#A3E635]" />
                My Passes
              </span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold ${
                activeTab === 'admin' 
                  ? 'bg-[#18181B] text-[#A3E635] border border-[#27272A]' 
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#18181B]/50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#A3E635]" />
                Admin Portal
              </span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => { onOpenCreateModal(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-[#A3E635] text-[#09090B] shadow-sm mt-2"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          )}

          {user ? (
            <div className="pt-3 mt-2 border-t border-[#27272A] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#FAFAFA]">{user.name}</p>
                <p className="text-[11px] text-[#A1A1AA] capitalize">{user.role} • {user.email}</p>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#27272A]">
              <button
                onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }}
                className="py-2 text-center text-xs font-semibold text-[#FAFAFA] bg-[#18181B] rounded-lg border border-[#27272A]"
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('register'); setMobileMenuOpen(false); }}
                className="py-2 text-center text-xs font-bold bg-[#A3E635] text-[#09090B] rounded-lg"
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
