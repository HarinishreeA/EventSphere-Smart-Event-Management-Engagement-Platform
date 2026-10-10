import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  X,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Camera,
  CameraOff,
  RotateCcw,
  BadgeCheck,
  Loader2,
  User,
  Calendar,
  Hash,
  Clock,
  Sparkles,
} from 'lucide-react';
import API from '../services/api';

/* ─── constants ─────────────────────────────────────────────── */
const SCANNER_ELEMENT_ID = 'eventsphere-qr-scanner';

const STATES = {
  PERMISSION:  'permission',   // asking / waiting for camera permission
  SCANNING:    'scanning',     // camera active, reading QR
  PROCESSING:  'processing',   // API call in flight
  SUCCESS:     'success',      // check-in recorded
  DUPLICATE:   'duplicate',    // already checked in
  ERROR:       'error',        // invalid QR / backend error / camera denied
};

/* ─── component ─────────────────────────────────────────────── */
const QRScannerModal = ({ isOpen, onClose }) => {
  const [scanState, setScanState] = useState(STATES.PERMISSION);
  const [errorMsg, setErrorMsg]   = useState('');
  const [result, setResult]       = useState(null); // success or duplicate payload
  const scannerRef = useRef(null);
  const overlayRef = useRef(null);

  /* ── stop camera helper ── */
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (_) { /* ignore */ }
      scannerRef.current = null;
    }
  }, []);

  /* ── start camera ── */
  const startScanner = useCallback(async () => {
    setScanState(STATES.SCANNING);
    setErrorMsg('');

    // Small delay to ensure DOM node exists after state render
    await new Promise((r) => setTimeout(r, 120));

    const element = document.getElementById(SCANNER_ELEMENT_ID);
    if (!element) return;

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        onQRCodeDetected,
        () => { /* frame errors – ignored */ }
      );
    } catch (err) {
      const msg = err?.message || String(err);
      const isDenied = msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed');
      setErrorMsg(
        isDenied
          ? 'Camera access was denied. Please allow camera permission in your browser settings and try again.'
          : `Camera could not be started: ${msg}`
      );
      setScanState(STATES.ERROR);
      scannerRef.current = null;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── QR detected callback ── */
  const onQRCodeDetected = useCallback(async (rawText) => {
    // Stop scanning immediately to avoid duplicate API calls
    await stopScanner();
    setScanState(STATES.PROCESSING);
    setErrorMsg('');

    /* Parse payload */
    let payload;
    try {
      payload = JSON.parse(rawText);
    } catch {
      setScanState(STATES.ERROR);
      setErrorMsg('Invalid QR code format. This QR code was not issued by EventSphere.');
      return;
    }

    const { ticketCode, eventId } = payload;

    if (!ticketCode || !eventId) {
      setScanState(STATES.ERROR);
      setErrorMsg('QR code is missing required ticket information (ticketCode or eventId). Please use a valid EventSphere Digital Pass.');
      return;
    }

    /* Hit backend check-in endpoint */
    try {
      const { data } = await API.post('/attendance/check-in', { ticketCode, eventId });
      setResult({
        type: 'success',
        attendee: data.attendee,
        checkedInAt: data.checkedInAt,
        ticketCode: data.ticketCode || ticketCode,
        eventTitle: data.eventTitle,
        totalCheckedIn: data.totalCheckedIn,
        totalConfirmed: data.totalConfirmed,
      });
      setScanState(STATES.SUCCESS);
    } catch (err) {
      const status = err?.response?.status;
      const body   = err?.response?.data;

      if (status === 409 && body?.alreadyCheckedIn) {
        setResult({
          type: 'duplicate',
          attendee: body.attendee,
          checkedInAt: body.checkedInAt,
          checkInMethod: body.checkInMethod,
          ticketCode,
        });
        setScanState(STATES.DUPLICATE);
      } else {
        setScanState(STATES.ERROR);
        setErrorMsg(body?.message || 'Backend check-in failed. Please try again.');
      }
    }
  }, [stopScanner]);

  /* ── Lifecycle: open/close ── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setScanState(STATES.PERMISSION);
      setResult(null);
      setErrorMsg('');
      // Auto-start camera after permission UI briefly shown
      const t = setTimeout(() => startScanner(), 300);
      return () => clearTimeout(t);
    } else {
      document.body.style.overflow = '';
      stopScanner();
      setScanState(STATES.PERMISSION);
      setResult(null);
      setErrorMsg('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Escape key ── */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = async () => {
    await stopScanner();
    onClose();
  };

  /* ── Reset for next scan ── */
  const handleScanNext = async () => {
    setResult(null);
    setErrorMsg('');
    await startScanner();
  };

  /* ── Backdrop click ── */
  const handleBackdrop = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  /* ── Helpers ── */
  const fmtTime = (iso) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

  if (!isOpen) return null;

  /* ════════════════════════════════════════════════════════════ */
  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="QR Check-in Scanner"
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-[#27272A] shadow-[0_32px_80px_rgba(0,0,0,0.9)]"
        style={{ background: '#18181B', animation: 'fadeInScale 0.22s ease-out forwards' }}
      >
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272A]" style={{ background: '#09090B' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#A3E635' }}>
              <QrCode className="w-4 h-4 text-[#09090B]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#FAFAFA] tracking-wide">QR Check-in Scanner</p>
              <p className="text-[10px] text-[#71717A]">EventSphere Admin</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-[#FAFAFA] transition-all"
            aria-label="Close scanner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ══════════ PERMISSION / SCANNING STATE ══════════ */}
        {(scanState === STATES.PERMISSION || scanState === STATES.SCANNING) && (
          <div className="p-5 space-y-4">
            {/* Status pill */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {scanState === STATES.SCANNING ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-pulse" />
                    <span className="text-[11px] font-bold text-[#A3E635]">Camera Active — Point at QR Code</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-[#A1A1AA] animate-spin" />
                    <span className="text-[11px] font-bold text-[#A1A1AA]">Starting camera…</span>
                  </>
                )}
              </div>
            </div>

            {/* Camera viewport */}
            <div className="relative rounded-2xl overflow-hidden border border-[#27272A]" style={{ background: '#09090B' }}>
              {/* The html5-qrcode library mounts a video element inside this div */}
              <div
                id={SCANNER_ELEMENT_ID}
                className="w-full"
                style={{ minHeight: '280px' }}
              />

              {/* Scanning frame overlay */}
              {scanState === STATES.SCANNING && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-48 h-48">
                    {/* Corner marks */}
                    <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#A3E635] rounded-tl-lg" />
                    <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#A3E635] rounded-tr-lg" />
                    <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#A3E635] rounded-bl-lg" />
                    <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#A3E635] rounded-br-lg" />
                    {/* Scan line */}
                    <span
                      className="absolute left-2 right-2 h-0.5 rounded-full"
                      style={{ background: 'linear-gradient(to right, transparent, #A3E635, transparent)', animation: 'scanLine 2s ease-in-out infinite', top: '50%' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#52525B] text-center leading-relaxed">
              Hold the student's Digital Pass QR code steady inside the frame.
            </p>
          </div>
        )}

        {/* ══════════ PROCESSING STATE ══════════ */}
        {scanState === STATES.PROCESSING && (
          <div className="flex flex-col items-center justify-center py-14 px-5 gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-[#27272A]" style={{ background: '#09090B' }}>
              <Loader2 className="w-7 h-7 text-[#A3E635] animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-[#FAFAFA]">Validating Ticket…</p>
              <p className="text-xs text-[#71717A]">Checking with EventSphere attendance server</p>
            </div>
          </div>
        )}

        {/* ══════════ SUCCESS STATE ══════════ */}
        {scanState === STATES.SUCCESS && result && (
          <div className="p-5 space-y-4">
            {/* Success banner */}
            <div className="rounded-2xl p-4 border flex items-start gap-3" style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }}>
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-extrabold text-[#22C55E]">Check-in Successful</p>
                <p className="text-[11px] text-[#22C55E]/70 mt-0.5">Attendance has been recorded.</p>
              </div>
            </div>

            {/* Attendee card */}
            <div className="rounded-2xl border border-[#27272A] overflow-hidden" style={{ background: '#09090B' }}>
              <div className="px-4 py-3 border-b border-[#27272A] flex items-center gap-2">
                <BadgeCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">Attendee Details</span>
              </div>
              <div className="p-4 space-y-3">
                {result.attendee && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-[#09090B] shrink-0" style={{ background: '#A3E635' }}>
                      {(result.attendee.name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#FAFAFA]">{result.attendee.name || '—'}</p>
                      <p className="text-[11px] text-[#A1A1AA]">{result.attendee.email || ''}</p>
                      {result.attendee.department && (
                        <p className="text-[10px] text-[#71717A]">{result.attendee.department}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#27272A]">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#52525B]">Ticket</p>
                    <p className="text-[11px] font-mono font-bold text-[#A3E635]">{result.ticketCode}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#52525B]">Check-in Time</p>
                    <p className="text-[11px] font-semibold text-[#FAFAFA]">{fmtTime(result.checkedInAt)}</p>
                  </div>
                  {(result.totalCheckedIn != null) && (
                    <div className="col-span-2 space-y-0.5 pt-2 border-t border-[#27272A]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#52525B]">Session Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[#27272A] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${result.totalConfirmed > 0 ? Math.round((result.totalCheckedIn / result.totalConfirmed) * 100) : 0}%`, background: '#A3E635' }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-[#A3E635] shrink-0">
                          {result.totalCheckedIn}/{result.totalConfirmed} in
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scan next */}
            <button
              onClick={handleScanNext}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 hover:brightness-110"
              style={{ background: '#A3E635', color: '#09090B' }}
            >
              <RotateCcw className="w-4 h-4" />
              Scan Next Attendee
            </button>
          </div>
        )}

        {/* ══════════ DUPLICATE STATE ══════════ */}
        {scanState === STATES.DUPLICATE && result && (
          <div className="p-5 space-y-4">
            {/* Duplicate banner */}
            <div className="rounded-2xl p-4 border flex items-start gap-3" style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.3)' }}>
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-extrabold text-amber-400">Already Checked In</p>
                <p className="text-[11px] text-amber-400/70 mt-0.5">
                  This pass was already scanned
                  {result.checkedInAt ? ` at ${fmtTime(result.checkedInAt)}` : ''}.
                </p>
              </div>
            </div>

            {/* Info card */}
            {(result.attendee || result.ticketCode) && (
              <div className="rounded-2xl border border-[#27272A] p-4 space-y-3" style={{ background: '#09090B' }}>
                {result.attendee && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-[#09090B] shrink-0" style={{ background: '#71717A' }}>
                      {(result.attendee.name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#FAFAFA]">{result.attendee.name || '—'}</p>
                      <p className="text-[11px] text-[#A1A1AA]">{result.attendee.email || ''}</p>
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-[#27272A] space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#52525B]">Ticket Code</p>
                  <p className="text-[11px] font-mono font-bold text-[#71717A]">{result.ticketCode}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleScanNext}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-[#3F3F46]"
              style={{ background: '#27272A', color: '#FAFAFA' }}
            >
              <RotateCcw className="w-4 h-4" />
              Scan Next
            </button>
          </div>
        )}

        {/* ══════════ ERROR STATE ══════════ */}
        {scanState === STATES.ERROR && (
          <div className="p-5 space-y-4">
            <div className="rounded-2xl p-4 border flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' }}>
              <CameraOff className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-extrabold text-rose-400">Scanner Error</p>
                <p className="text-[11px] text-rose-400/80 mt-1 leading-relaxed">{errorMsg}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={startScanner}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ background: '#A3E635', color: '#09090B' }}
              >
                <Camera className="w-3.5 h-3.5" />
                Retry Camera
              </button>
              <button
                onClick={handleClose}
                className="py-2.5 px-4 rounded-xl font-bold text-xs text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors border border-[#27272A] hover:bg-[#27272A]"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-5 py-2.5 border-t border-[#27272A] flex items-center gap-1.5" style={{ background: '#09090B' }}>
          <Sparkles className="w-2.5 h-2.5 text-[#3F3F46]" />
          <span className="text-[10px] text-[#3F3F46]">EventSphere · Admin Check-in Tool · Secure</span>
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes scanLine {
          0%   { top: 15%; opacity: 0.6; }
          50%  { top: 80%; opacity: 1;   }
          100% { top: 15%; opacity: 0.6; }
        }
        /* Override html5-qrcode internal styles to match dark theme */
        #${SCANNER_ELEMENT_ID} video {
          width: 100% !important;
          border-radius: 0 !important;
          object-fit: cover;
        }
        #${SCANNER_ELEMENT_ID} > div > img { display: none !important; }
        #${SCANNER_ELEMENT_ID} > div { border: none !important; }
      `}</style>
    </div>
  );
};

export default QRScannerModal;
