import React from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle2, AlertCircle, Edit3, Trash2, ShieldCheck, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const spotsLeft = Math.max(0, capacity - attendeeCount);
  const fillPercentage = Math.min(100, Math.round((attendeeCount / capacity) * 100));

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={`surface-card rounded-2xl overflow-hidden flex flex-col justify-between relative group border border-[#27272A] hover:border-[#A3E635]/40 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] transition-all duration-300 ${isSocketUpdated ? 'ring-1 ring-[#A3E635] shadow-[0_0_20px_rgba(163,230,53,0.15)]' : ''
      }`}>

      {/* Real-time live update pulse badge */}
      {isSocketUpdated && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#09090B]/90 text-[#A3E635] text-[10px] font-bold border border-[#A3E635]/40 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] pulse-indicator" />
          Live Update
        </div>
      )}

      <div>
        {/* Cover Image Banner */}
        <div className="relative h-48 overflow-hidden bg-[#18181B] cursor-pointer" onClick={() => onViewDetails(event)}>
          <img
            src={event.imageUrl || defaultImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => { e.target.src = defaultImage; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-black/40" />

          {/* Category Tag */}
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#09090B]/90 text-[#FAFAFA] border border-[#27272A] backdrop-blur-md shadow-sm">
              {event.category}
            </span>
          </div>

          {/* User RSVP Status Badge */}
          {userRSVPStatus && (
            <div className="absolute bottom-3 left-3 z-10">
              {userRSVPStatus === 'confirmed' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#09090B]/95 text-[#A3E635] text-[11px] font-bold border border-[#A3E635]/40 backdrop-blur-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" />
                  Pass Confirmed
                </span>
              ) : userRSVPStatus === 'waitlisted' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#09090B]/95 text-amber-400 text-[11px] font-bold border border-amber-500/40 backdrop-blur-md">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Waitlist Position #{waitlistCount}
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3.5">
          <div>
            <h3
              onClick={() => onViewDetails(event)}
              className="text-base font-bold text-[#FAFAFA] group-hover:text-[#A3E635] transition-colors line-clamp-1 cursor-pointer"
            >
              {event.title}
            </h3>
            <p className="text-[11px] text-[#A1A1AA] flex items-center gap-1.5 font-medium mt-1">
              <User className="w-3 h-3 text-[#A3E635] shrink-0" />
              <span className="truncate">{event.organizer}</span>
            </p>
          </div>

          <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed min-h-[36px]">
            {event.description}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#A1A1AA] pt-3 border-t border-[#27272A]">
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 text-[#A3E635] shrink-0" />
              <span className="truncate text-[#FAFAFA] font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-[#A3E635] shrink-0" />
              <span className="truncate">{event.time}</span>
            </div>
            <div className="col-span-2 flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
              <span className="truncate text-zinc-300">{event.location}</span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="space-y-1.5 pt-2.5 border-t border-[#27272A]">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-[#A1A1AA]">
                <Users className="w-3 h-3 text-[#A3E635]" />
                <span>
                  <strong className="text-[#FAFAFA]">{attendeeCount}</strong> / {capacity}
                </span>
              </span>

              {isFull ? (
                <span className="text-amber-400 font-bold text-[10px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Full {waitlistCount > 0 ? `(${waitlistCount} on waitlist)` : ''}
                </span>
              ) : (
                <span className="text-[#A3E635] font-bold text-[10px]">
                  {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining
                </span>
              )}
            </div>

            <div className="w-full h-1.5 rounded-full bg-[#27272A] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${fillPercentage >= 100
                  ? 'bg-amber-500'
                  : 'bg-[#A3E635]'
                  }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0 space-y-2.5">
        {/* Student RSVP Actions */}
        {isStudent ? (
          userRSVPStatus ? (
            <button
              onClick={() => onCancelRSVP(event._id)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#18181B] hover:bg-rose-950/30 text-[#A1A1AA] hover:text-rose-300 border border-[#27272A] hover:border-rose-900/50 transition-all flex items-center justify-center gap-1.5"
            >
              Cancel RSVP ({userRSVPStatus})
            </button>
          ) : (
            <button
              onClick={() => onRSVP(event._id)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${isFull
                ? 'bg-[#27272A] hover:bg-[#3F3F46] text-amber-300 border border-amber-500/30 shadow-sm'
                : 'bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B] shadow-sm'
                }`}
            >
              {isFull ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  Join Waitlist
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  RSVP Now
                </>
              )}
            </button>
          )
        ) : !user ? (
          <button
            onClick={() => onRSVP(event._id)}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] border border-[#3F3F46] transition-all flex items-center justify-center gap-1.5"
          >
            Sign in to RSVP
          </button>
        ) : null}

        {/* Admin Action Controls */}
        {isAdmin && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#27272A]">
            <button
              onClick={() => onViewAttendees(event)}
              className="flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold text-[#FAFAFA] bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#A3E635]" />
              Roster ({attendeeCount})
            </button>
            <button
              onClick={() => onEdit(event)}
              title="Edit Event"
              className="p-1.5 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] rounded-lg transition-colors border border-transparent hover:border-[#3F3F46]"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(event._id)}
              title="Delete Event"
              className="p-1.5 text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/40"
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
