import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle2, AlertCircle, Mail, Building, Hash } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-md animate-fade-in">
      <div className="surface-card rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-[#27272A] shadow-2xl p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272A] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#09090B] text-[#A3E635] flex items-center justify-center border border-[#27272A]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#FAFAFA] line-clamp-1">{event.title}</h2>
              <p className="text-xs text-[#A1A1AA] font-medium">Attendee Roster & Waitlist Management</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A1A1AA] hover:text-[#FAFAFA] rounded-lg hover:bg-[#27272A] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-[#09090B] p-1.5 rounded-xl border border-[#27272A] mb-4">
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'confirmed'
                ? 'bg-[#A3E635] text-[#09090B] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed Passes ({confirmedList.length} / {event.capacity})
          </button>
          
          <button
            onClick={() => setActiveTab('waitlisted')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'waitlisted'
                ? 'bg-amber-400 text-[#09090B] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Waitlist Queue ({waitlistedList.length})
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {loading ? (
            <div className="text-center py-12 text-[#A1A1AA] text-xs">
              Loading attendee records...
            </div>
          ) : activeTab === 'confirmed' ? (
            confirmedList.length > 0 ? (
              confirmedList.map((rsvp, idx) => (
                <div key={rsvp._id} className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#18181B] text-[#A3E635] font-bold text-xs flex items-center justify-center border border-[#27272A]">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#FAFAFA]">{rsvp.user?.name || 'Student'}</p>
                      <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[#A1A1AA] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#A3E635]" />
                          {rsvp.user?.email}
                        </span>
                        {rsvp.user?.department && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-[#A1A1AA]" />
                            {rsvp.user?.department}
                          </span>
                        )}
                        {rsvp.user?.studentId && (
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3 text-[#A1A1AA]" />
                            ID: {rsvp.user?.studentId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-[#A1A1AA] font-medium bg-[#18181B] px-2 py-1 rounded-md border border-[#27272A] hidden sm:inline-block">
                    RSVP: {new Date(rsvp.registeredAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[#A1A1AA] text-xs">
                No confirmed registrations for this event yet.
              </div>
            )
          ) : (
            waitlistedList.length > 0 ? (
              waitlistedList.map((rsvp, idx) => (
                <div key={rsvp._id} className="p-3 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#18181B] text-amber-400 font-bold text-xs flex items-center justify-center border border-[#27272A]">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#FAFAFA]">{rsvp.user?.name || 'Student'}</p>
                      <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-[#A1A1AA] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-amber-400" />
                          {rsvp.user?.email}
                        </span>
                        {rsvp.user?.department && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-[#A1A1AA]" />
                            {rsvp.user?.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-amber-300 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Queue #{idx + 1}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[#A1A1AA] text-xs">
                Waitlist is currently empty.
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-[#27272A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-semibold text-xs bg-[#09090B] hover:bg-[#27272A] text-[#FAFAFA] border border-[#27272A] transition-colors"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeeListModal;
