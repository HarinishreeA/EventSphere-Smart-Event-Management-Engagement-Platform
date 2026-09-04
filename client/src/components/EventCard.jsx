import React from 'react';
import { Calendar, Clock, MapPin, Users, UserCheck, AlertCircle, Edit3, Trash2, ShieldCheck, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const categoryColors = {
  Fest: 'from-pink-500 to-rose-600 border-pink-500/30 text-pink-300',
  Workshop: 'from-blue-500 to-indigo-600 border-blue-500/30 text-blue-300',
  'Guest Lecture': 'from-amber-500 to-orange-600 border-amber-500/30 text-amber-300',
  Competition: 'from-emerald-500 to-teal-600 border-emerald-500/30 text-emerald-300',
  Cultural: 'from-purple-500 to-violet-600 border-purple-500/30 text-purple-300',
  Sports: 'from-cyan-500 to-blue-600 border-cyan-500/30 text-cyan-300',
  Other: 'from-slate-500 to-slate-700 border-slate-500/30 text-slate-300',
};

const defaultImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80';

const EventCard = ({
  event,
  userRSVPStatus,
  onRSVP,
  onCancelRSVP,
  onViewDetails,
  onEdit,
  onDelete,
  onViewAttendees,
  isSocketUpdated,
}) => {
  const { user, isAdmin, isStudent } = useAuth();

  const attendeeCount = event.attendeeCount || 0;
  const capacity = event.capacity || 1;
  const waitlistCount = event.waitlistCount || 0;
  const isFull = attendeeCount >= capacity;
  const fillPercentage = Math.min(100, Math.round((attendeeCount / capacity) * 100));

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={`glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between relative group ${isSocketUpdated ? 'ring-2 ring-brand-500 shadow-brand-500/30 shadow-2xl transition-all' : ''}`}>
      
      {/* Real-time update live indicator badge */}
      {isSocketUpdated && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/90 text-white text-xs font-bold shadow-lg backdrop-blur-md animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-badge" />
          Live Update
        </div>
      )}

      <div>
        {/* Event Image Banner Header */}
        <div className="relative h-48 overflow-hidden bg-slate-900">
          <img
            src={event.imageUrl || defaultImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = defaultImage; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-slate-950/70 shadow-lg ${categoryColors[event.category] || categoryColors.Other}`}>
              {event.category}
            </span>
          </div>

          {/* User RSVP Status Banner Badge on image */}
          {userRSVPStatus && (
            <div className="absolute bottom-3 left-3 z-10">
              {userRSVPStatus === 'confirmed' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/90 text-white text-xs font-bold shadow-lg backdrop-blur-md border border-emerald-400/50">
                  <UserCheck className="w-3.5 h-3.5" />
                  RSVP Confirmed
                </span>
              ) : userRSVPStatus === 'waitlisted' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/90 text-white text-xs font-bold shadow-lg backdrop-blur-md border border-amber-400/50">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Waitlisted (# {waitlistCount})
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <h3
              onClick={() => onViewDetails(event)}
              className="text-lg font-bold text-slate-100 hover:text-brand-300 transition-colors line-clamp-1 cursor-pointer"
            >
              {event.title}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Award className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              Organized by <span className="text-slate-200">{event.organizer}</span>
            </p>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="truncate">{event.time}</span>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          {/* Attendee Capacity Meter & Live Count */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1 text-slate-300">
                <Users className="w-3.5 h-3.5 text-brand-400" />
                Attendees:
                <span className="text-white font-extrabold">{attendeeCount}</span> / {capacity}
              </span>
              
              {isFull ? (
                <span className="text-amber-400 font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Full {waitlistCount > 0 ? `(${waitlistCount} Waitlisted)` : ''}
                </span>
              ) : (
                <span className="text-emerald-400 font-bold text-[11px]">
                  {capacity - attendeeCount} spots left
                </span>
              )}
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  fillPercentage >= 100
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : fillPercentage >= 80
                    ? 'bg-gradient-to-r from-brand-500 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-500 to-brand-500'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0 space-y-3">
        {/* RSVP Buttons for Student User */}
        {isStudent ? (
          userRSVPStatus ? (
            <button
              onClick={() => onCancelRSVP(event._id)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 transition-all flex items-center justify-center gap-2"
            >
              Cancel RSVP ({userRSVPStatus})
            </button>
          ) : (
            <button
              onClick={() => onRSVP(event._id)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 ${
                isFull
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/20'
                  : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-brand-600/25'
              }`}
            >
              {isFull ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Join Waitlist
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  RSVP Now
                </>
              )}
            </button>
          )
        ) : !user ? (
          <button
            onClick={() => onRSVP(event._id)}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            Sign in to RSVP
          </button>
        ) : null}

        {/* Admin Specific Action Controls */}
        {isAdmin && (
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
            <button
              onClick={() => onViewAttendees(event)}
              className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Attendees ({attendeeCount})
            </button>
            <button
              onClick={() => onEdit(event)}
              title="Edit Event"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(event._id)}
              title="Delete Event"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
