import React from 'react';
import { X, Calendar, Clock, MapPin, Users, Award, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80';

const EventDetailModal = ({ event, userRSVPStatus, isOpen, onClose, onRSVP, onCancelRSVP }) => {
  const { user, isStudent } = useAuth();
  if (!isOpen || !event) return null;

  const attendeeCount = event.attendeeCount || 0;
  const capacity = event.capacity || 1;
  const waitlistCount = event.waitlistCount || 0;
  const isFull = attendeeCount >= capacity;
  const fillPercentage = Math.min(100, Math.round((attendeeCount / capacity) * 100));

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-card rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-700/80 shadow-2xl p-0 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700 shadow-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Cover Image */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
          <img
            src={event.imageUrl || defaultImage}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = defaultImage; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          {/* Category Pill */}
          <div className="absolute top-4 left-4 z-20">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-brand-600/90 text-white shadow-lg backdrop-blur-md border border-brand-400/40">
              {event.category}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
              {event.title}
            </h2>
            <p className="text-sm text-brand-300 flex items-center gap-1.5 font-semibold">
              <Award className="w-4 h-4 text-brand-400" />
              Organized by {event.organizer}
            </p>
          </div>
        </div>

        {/* Body Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Date</p>
                <p className="text-xs font-bold text-white">{formattedDate}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Time</p>
                <p className="text-xs font-bold text-white">{event.time}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Location</p>
                <p className="text-xs font-bold text-white">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">About This Event</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Capacity Progress Meter */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2 text-white">
                <Users className="w-4 h-4 text-brand-400" />
                Live Attendance Status: <span className="text-brand-300">{attendeeCount} Confirmed</span> / {capacity} Capacity
              </span>

              {isFull ? (
                <span className="text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  Full ({waitlistCount} Waitlisted)
                </span>
              ) : (
                <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {capacity - attendeeCount} Spots Available
                </span>
              )}
            </div>

            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  fillPercentage >= 100
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-emerald-500 to-brand-500'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* Footer RSVP Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {userRSVPStatus && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <span>Your Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  userRSVPStatus === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {userRSVPStatus === 'confirmed' ? 'RSVP Confirmed' : `Waitlisted Queue #${waitlistCount}`}
                </span>
              </div>
            )}

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                Close
              </button>

              {isStudent ? (
                userRSVPStatus ? (
                  <button
                    onClick={() => { onCancelRSVP(event._id); onClose(); }}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
                  >
                    Cancel My RSVP
                  </button>
                ) : (
                  <button
                    onClick={() => { onRSVP(event._id); onClose(); }}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center gap-2 ${
                      isFull ? 'bg-amber-600 hover:bg-amber-500' : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/30'
                    }`}
                  >
                    {isFull ? <AlertCircle className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    {isFull ? 'Join Waitlist' : 'RSVP Now'}
                  </button>
                )
              ) : !user ? (
                <button
                  onClick={() => { onRSVP(event._id); onClose(); }}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-600 text-white"
                >
                  Sign in to RSVP
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
