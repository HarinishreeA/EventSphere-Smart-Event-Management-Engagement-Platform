import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Info,
  Loader2,
  ChevronRight,
  Share2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const defaultImage =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

const EventDetailModal = ({
  event,
  userRSVPStatus,
  isOpen,
  onClose,
  onRSVP,
  onCancelRSVP,
}) => {
  const { user, isStudent, isAdmin } = useAuth();
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset local states when event changes or modal closes
  useEffect(() => {
    setLoadingAction(false);
    setErrorMessage('');
    setCopiedLink(false);
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const attendeeCount = event.attendeeCount || 0;
  const capacity = event.capacity || 1;
  const waitlistCount = event.waitlistCount || 0;
  const isFull = attendeeCount >= capacity;
  const spotsRemaining = Math.max(0, capacity - attendeeCount);
  const fillPercentage = Math.min(100, Math.round((attendeeCount / capacity) * 100));

  const formattedFullDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const eventStatus = event.status || 'upcoming';

  const handleRSVPAction = async () => {
    setLoadingAction(true);
    setErrorMessage('');
    try {
      await onRSVP(event._id);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process RSVP. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancelAction = async () => {
    if (!window.confirm('Are you sure you want to cancel your pass for this event? If there is a waitlist, your spot will be given to the next queued student.')) {
      return;
    }
    setLoadingAction(true);
    setErrorMessage('');
    try {
      await onCancelRSVP(event._id);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to cancel RSVP. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#09090B]/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div
        className="surface-card rounded-3xl w-full max-w-3xl overflow-hidden border border-[#27272A] shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-0 relative my-auto animate-modal-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar with Close & Share */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-[#09090B]/80 hover:bg-[#18181B] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#27272A] transition-all backdrop-blur-md"
            title="Copy event link"
            aria-label="Share Event"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#09090B]/80 hover:bg-[#18181B] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#27272A] transition-all backdrop-blur-md"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Cover Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#18181B]">
          <img
            src={event.imageUrl || defaultImage}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = defaultImage; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-[#18181B]/40 to-black/50" />

          {/* Top Badges (Category & Status) */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#09090B]/90 text-[#FAFAFA] border border-[#27272A] backdrop-blur-md shadow-sm">
              {event.category}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border ${
              eventStatus === 'upcoming'
                ? 'bg-lime-950/80 text-[#A3E635] border-lime-500/40'
                : eventStatus === 'ongoing'
                ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                : 'bg-zinc-900/90 text-zinc-400 border-zinc-700'
            }`}>
              {eventStatus}
            </span>
          </div>

          {/* Title & Host Header in Banner */}
          <div className="absolute bottom-5 left-5 right-5 z-20 space-y-2">
            <h2
              id="event-modal-title"
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FAFAFA] leading-tight tracking-tight drop-shadow-md"
            >
              {event.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#A1A1AA]">
              <span className="flex items-center gap-1.5 text-[#A3E635] font-semibold bg-[#09090B]/80 px-2.5 py-1 rounded-md border border-[#27272A] backdrop-blur-md">
                <User className="w-3.5 h-3.5 shrink-0" />
                Organized by {event.organizer}
              </span>
              {copiedLink && (
                <span className="text-[11px] text-[#A3E635] font-bold animate-pulse">
                  ✓ Link copied to clipboard
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-8 space-y-7 max-h-[calc(90vh-16rem)] overflow-y-auto">
          
          {/* Error Banner Alert */}
          {errorMessage && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="flex-1">{errorMessage}</p>
              <button onClick={() => setErrorMessage('')} className="p-1 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 1. Scannable Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Date Card */}
            <div className="p-3.5 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#18181B] text-[#A3E635] flex items-center justify-center border border-[#27272A] shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Date</p>
                <p className="text-xs font-semibold text-[#FAFAFA] truncate">{formattedFullDate}</p>
              </div>
            </div>

            {/* Time Card */}
            <div className="p-3.5 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#18181B] text-[#A3E635] flex items-center justify-center border border-[#27272A] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Time</p>
                <p className="text-xs font-semibold text-[#FAFAFA] truncate">{event.time}</p>
              </div>
            </div>

            {/* Location Card */}
            <div className="p-3.5 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#18181B] text-[#A3E635] flex items-center justify-center border border-[#27272A] shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Venue</p>
                <p className="text-xs font-semibold text-[#FAFAFA] truncate">{event.location}</p>
              </div>
            </div>

            {/* Availability Card */}
            <div className="p-3.5 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#18181B] text-[#A3E635] flex items-center justify-center border border-[#27272A] shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Availability</p>
                <p className="text-xs font-semibold text-[#FAFAFA] truncate">
                  {isFull ? 'Full Capacity' : `${spotsRemaining} Spots Open`}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Visual Capacity & Waitlist Progress Meter */}
          <div className="p-5 rounded-2xl bg-[#09090B] border border-[#27272A] space-y-3 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#A3E635]" />
                <span className="font-semibold text-[#FAFAFA]">Live Attendance Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#A1A1AA]">
                  <strong className="text-[#FAFAFA]">{attendeeCount}</strong> / {capacity} seats claimed
                </span>
                {isFull ? (
                  <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-400/20">
                    Full ({waitlistCount} queued)
                  </span>
                ) : (
                  <span className="text-[#A3E635] bg-[#A3E635]/10 px-2 py-0.5 rounded text-[11px] font-bold border border-[#A3E635]/20">
                    {spotsRemaining} {spotsRemaining === 1 ? 'seat' : 'seats'} available
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-[#18181B] overflow-hidden p-0.5 border border-[#27272A]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  fillPercentage >= 100
                    ? 'bg-amber-500'
                    : 'bg-[#A3E635]'
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>

            {/* Waitlist Policy Info Note */}
            {isFull && (
              <div className="flex items-start gap-2 pt-1 text-[11px] text-[#A1A1AA] leading-relaxed">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  This event is currently at maximum capacity. Joining the waitlist reserves your position in the automated FIFO queue. If a confirmed participant cancels, you will be promoted automatically.
                </span>
              </div>
            )}
          </div>

          {/* 3. Event Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
              Event Description & Overview
            </h3>
            <div className="p-5 rounded-2xl bg-[#09090B]/60 border border-[#27272A] text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* 4. Dedicated Registration / RSVP Panel */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#18181B] to-[#09090B] border border-[#27272A] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-[#FAFAFA]">Participation & Pass Registration</h4>
                <p className="text-xs text-[#A1A1AA]">Instant reservation confirmation with real-time seat lock.</p>
              </div>

              {/* Status Badge */}
              {userRSVPStatus && (
                <span className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                  userRSVPStatus === 'confirmed'
                    ? 'bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/30'
                    : 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                }`}>
                  {userRSVPStatus === 'confirmed' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" />
                      Pass Confirmed
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      Waitlisted Queue
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Action Triggers based on User State */}
            {isStudent ? (
              userRSVPStatus === 'confirmed' ? (
                /* Confirmed State */
                <div className="p-4 rounded-xl bg-lime-950/20 border border-lime-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#A3E635] font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>You hold a confirmed pass for this event!</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Your seat is reserved in the venue attendance log. If you can no longer attend, please cancel your reservation so a waitlisted student can take your spot.
                  </p>
                  <button
                    onClick={handleCancelAction}
                    disabled={loadingAction}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[#18181B] hover:bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:border-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Cancel My RSVP
                  </button>
                </div>
              ) : userRSVPStatus === 'waitlisted' ? (
                /* Waitlisted State */
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>You are queued in the automated waitlist</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    We will notify you and update your pass status automatically as soon as a confirmed attendee cancels.
                  </p>
                  <button
                    onClick={handleCancelAction}
                    disabled={loadingAction}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[#18181B] hover:bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:border-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Leave Waitlist
                  </button>
                </div>
              ) : (
                /* Not Registered State */
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-[#A1A1AA]">
                    {isFull
                      ? 'Capacity reached. Join queue for automatic spot promotion.'
                      : 'Seats available. Complete registration with 1 click.'}
                  </div>
                  <button
                    onClick={handleRSVPAction}
                    disabled={loadingAction}
                    className={`px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-95 ${
                      isFull
                        ? 'bg-[#27272A] hover:bg-[#3F3F46] text-amber-300 border border-amber-500/30'
                        : 'bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B]'
                    }`}
                  >
                    {loadingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin text-current" />
                    ) : isFull ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Join Waitlist (Queue #{waitlistCount + 1})
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        RSVP Now — Claim Pass
                      </>
                    )}
                  </button>
                </div>
              )
            ) : !user ? (
              /* Guest Prompt */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-[#09090B] border border-[#27272A]">
                <div className="text-xs text-[#A1A1AA]">
                  Sign in with your student credentials to reserve your event pass.
                </div>
                <button
                  onClick={() => { onClose(); onRSVP(event._id); }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#A3E635] text-[#09090B] hover:bg-[#84CC16] transition-all flex items-center justify-center gap-1.5"
                >
                  Sign In to Register
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : isAdmin ? (
              /* Admin Info */
              <div className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between text-xs text-[#A1A1AA]">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-[#A3E635]" />
                  Administrator Mode: Manage attendance and registrations in the Admin Portal.
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-4 sm:p-5 border-t border-[#27272A] bg-[#09090B] flex items-center justify-between">
          <p className="text-[11px] text-[#71717A]">
            EventSphere Smart Attendance System • Real-Time Synchronization
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
