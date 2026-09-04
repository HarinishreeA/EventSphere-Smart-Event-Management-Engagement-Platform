import React, { useState, useEffect } from 'react';
import { X, Users, UserCheck, AlertCircle, ShieldCheck, Mail, Building, Hash } from 'lucide-react';
import API from '../services/api';

const AttendeeListModal = ({ isOpen, onClose, event }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('confirmed');

  useEffect(() => {
    if (isOpen && event) {
      const fetchAttendees = async () => {
        setLoading(true);
        try {
          const res = await API.get(`/admin/events/${event._id}/attendees`);
          setData(res.data);
        } catch (err) {
          console.error('Error loading attendees:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchAttendees();
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const confirmedList = data?.confirmed || [];
  const waitlistedList = data?.waitlisted || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-slate-700/80 shadow-2xl p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white line-clamp-1">{event.title}</h2>
              <p className="text-xs text-slate-400 font-medium">Attendee Roster & Waitlist Management</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 mb-4">
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'confirmed'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Confirmed RSVPs ({confirmedList.length} / {event.capacity})
          </button>
          
          <button
            onClick={() => setActiveTab('waitlisted')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'waitlisted'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Waitlist Queue ({waitlistedList.length})
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Loading attendee records...
            </div>
          ) : activeTab === 'confirmed' ? (
            confirmedList.length > 0 ? (
              confirmedList.map((rsvp, idx) => (
                <div key={rsvp._id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/20">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{rsvp.user?.name || 'Student'}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-brand-400" />
                          {rsvp.user?.email}
                        </span>
                        {rsvp.user?.department && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-brand-400" />
                            {rsvp.user?.department}
                          </span>
                        )}
                        {rsvp.user?.studentId && (
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3 text-brand-400" />
                            ID: {rsvp.user?.studentId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    RSVP'd: {new Date(rsvp.registeredAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                No confirmed RSVPs yet for this event.
              </div>
            )
          ) : (
            waitlistedList.length > 0 ? (
              waitlistedList.map((rsvp, idx) => (
                <div key={rsvp._id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/20">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{rsvp.user?.name || 'Student'}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-amber-400" />
                          {rsvp.user?.email}
                        </span>
                        {rsvp.user?.department && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-amber-400" />
                            {rsvp.user?.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-amber-300 font-semibold bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40">
                    Queue Position #{idx + 1}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                Waitlist is currently empty.
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeeListModal;
