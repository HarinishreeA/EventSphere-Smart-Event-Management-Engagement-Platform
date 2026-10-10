import React, { useEffect, useState, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  User,
  BadgeCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Hash,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─── helpers ─────────────────────────────────────────────── */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const defaultBanner =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80';

/* ─── component ───────────────────────────────────────────── */
const DigitalPassModal = ({ isOpen, onClose, event }) => {
  const { user } = useAuth();
  const [passData, setPassData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef(null);

  /* Fetch pass on open */
  const fetchPass = useCallback(async () => {
    if (!event?._id) return;
    setLoading(true);
    setError('');
    setPassData(null);
    try {
      const { data } = await API.get(`/rsvp/${event._id}/my-pass`);
      setPassData(data.pass);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Unable to retrieve your digital pass. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [event?._id]);

  useEffect(() => {
    if (isOpen) {
      fetchPass();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setPassData(null);
      setError('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, fetchPass]);

  /* Escape key */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  /* QR payload — contains everything the check-in endpoint needs */
  const qrPayload = passData
    ? JSON.stringify({
        ticketCode: passData.ticketCode,
        eventId: event._id,
        userId: user?._id || user?.id,
      })
    : null;

  const isCheckedIn = passData?.checkedIn === true;

  /* ── backdrop click to close ── */
  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Digital Event Pass"
    >
      {/* ── Modal container ── */}
      <div
        className="relative w-full max-w-md my-auto animate-fadeInScale flex flex-col max-h-[90vh]"
        style={{ animation: 'fadeInScale 0.25s ease-out forwards' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-[#27272A] border border-[#3F3F46] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#3F3F46] transition-all shadow-lg"
          aria-label="Close digital pass"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ════════════ TICKET CARD ════════════ */}
        <div className="rounded-3xl overflow-y-auto max-h-[85vh] shadow-[0_32px_80px_rgba(0,0,0,0.9)] border border-[#27272A]" style={{ background: '#18181B' }}>

          {/* ── Top branding strip ── */}
          <div className="relative flex items-center justify-between px-5 py-3 border-b border-[#27272A]" style={{ background: 'linear-gradient(135deg, #09090B 0%, #18181B 100%)' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#A3E635' }}>
                <Ticket className="w-3.5 h-3.5 text-[#09090B]" />
              </div>
              <span className="text-xs font-black tracking-widest text-[#A3E635] uppercase">EventSphere</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border" style={{ background: 'rgba(163,230,53,0.08)', borderColor: 'rgba(163,230,53,0.25)' }}>
              <Sparkles className="w-3 h-3 text-[#A3E635]" />
              <span className="text-[10px] font-bold text-[#A3E635]">Digital Pass</span>
            </div>
          </div>

          {/* ── Event Banner ── */}
          <div className="relative h-36 overflow-hidden">
            <img
              src={event.imageUrl || defaultBanner}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = defaultBanner; }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #18181B 0%, rgba(9,9,11,0.5) 60%, transparent 100%)' }} />
            {/* Category badge */}
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-md" style={{ background: 'rgba(9,9,11,0.85)', color: '#FAFAFA', borderColor: '#27272A' }}>
              {event.category}
            </span>
            {/* Check-in status badge */}
            {passData && (
              <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border backdrop-blur-md ${isCheckedIn ? 'border-emerald-500/40' : 'border-lime-500/40'}`}
                style={{ background: isCheckedIn ? 'rgba(16,185,129,0.15)' : 'rgba(163,230,53,0.12)', color: isCheckedIn ? '#34D399' : '#A3E635' }}>
                {isCheckedIn ? <BadgeCheck className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                {isCheckedIn ? 'Checked In' : 'Pass Confirmed'}
              </span>
            )}
          </div>

          {/* ── Event Title ── */}
          <div className="px-5 pt-4 pb-2">
            <h2 className="text-base font-extrabold text-[#FAFAFA] leading-snug line-clamp-2">{event.title}</h2>
            <p className="text-xs text-[#A1A1AA] mt-1 flex items-center gap-1.5">
              <User className="w-3 h-3 text-[#A3E635] shrink-0" />
              {event.organizer}
            </p>
          </div>

          {/* ── Perforation divider ── */}
          <div className="relative my-3 mx-0 flex items-center">
            <div className="w-5 h-5 rounded-full shrink-0 -ml-2.5 border-r border-[#27272A]" style={{ background: '#09090B' }} />
            <div className="flex-1 border-t border-dashed border-[#3F3F46]" />
            <div className="w-5 h-5 rounded-full shrink-0 -mr-2.5 border-l border-[#27272A]" style={{ background: '#09090B' }} />
          </div>

          {/* ── Loading State ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 px-5">
              <Loader2 className="w-8 h-8 text-[#A3E635] animate-spin" />
              <p className="text-xs text-[#A1A1AA]">Retrieving your digital pass…</p>
            </div>
          )}

          {/* ── Error State ── */}
          {!loading && error && (
            <div className="mx-5 my-4 rounded-2xl p-4 border flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-rose-300">Pass Unavailable</p>
                <p className="text-[11px] text-rose-400/80 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* ── Pass Content ── */}
          {!loading && passData && (
            <>
              {/* Event meta grid */}
              <div className="px-5 grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Date</p>
                  <p className="text-xs font-semibold text-[#FAFAFA] flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-[#A3E635] shrink-0" />
                    {fmtDate(event.date)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Time</p>
                  <p className="text-xs font-semibold text-[#FAFAFA] flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#A3E635] shrink-0" />
                    {event.time}
                  </p>
                </div>
                <div className="col-span-2 space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Venue</p>
                  <p className="text-xs font-semibold text-[#FAFAFA] flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#A3E635] shrink-0" />
                    {event.location}
                  </p>
                </div>
              </div>

              {/* Attendee details */}
              <div className="mx-5 mt-4 rounded-2xl p-3.5 border border-[#27272A]" style={{ background: '#09090B' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] mb-2">Attendee</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black text-sm text-[#09090B]" style={{ background: '#A3E635' }}>
                    {(passData.user?.name || user?.name || 'S')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#FAFAFA] truncate">{passData.user?.name || user?.name || '—'}</p>
                    <p className="text-[11px] text-[#A1A1AA] truncate">{passData.user?.email || user?.email || '—'}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {(passData.user?.department || user?.department) && (
                        <span className="text-[10px] text-[#71717A]">{passData.user?.department || user?.department}</span>
                      )}
                      {(passData.user?.studentId || user?.studentId) && (
                        <span className="text-[10px] text-[#71717A] flex items-center gap-1">
                          <Hash className="w-2.5 h-2.5" />{passData.user?.studentId || user?.studentId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket code */}
              <div className="mx-5 mt-3 rounded-2xl p-3 border flex items-center justify-between gap-3" style={{ background: 'rgba(163,230,53,0.06)', borderColor: 'rgba(163,230,53,0.2)' }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">Ticket Code</p>
                  <p className="text-sm font-black tracking-widest text-[#A3E635] mt-0.5 font-mono">{passData.ticketCode}</p>
                </div>
                {isCheckedIn && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(52,211,153,0.12)' }}>
                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400">Attended</span>
                  </div>
                )}
              </div>

              {/* ── QR Code ── */}
              <div className="flex flex-col items-center py-5 px-5 gap-3">
                <div className="p-3 rounded-2xl border border-[#27272A] shadow-inner" style={{ background: '#FFFFFF' }}>
                  <QRCodeSVG
                    value={qrPayload}
                    size={148}
                    bgColor="#FFFFFF"
                    fgColor="#09090B"
                    level="M"
                    includeMargin={false}
                  />
                </div>
                {isCheckedIn ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs font-bold text-emerald-400">
                      Checked in · {passData.checkedInAt ? new Date(passData.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#71717A] text-center max-w-[220px] leading-relaxed">
                    Show this QR code to the event staff for quick check-in.
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── Footer strip ── */}
          <div className="px-5 py-3 border-t border-[#27272A] flex items-center justify-between" style={{ background: '#09090B' }}>
            <span className="text-[10px] text-[#52525B]">EventSphere · Smart Campus Platform</span>
            <span className="text-[10px] font-mono text-[#3F3F46]">
              {event._id?.slice(-8).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Inline keyframe */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DigitalPassModal;
