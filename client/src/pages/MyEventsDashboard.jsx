import React, { useState } from 'react';
import { BookmarkCheck, UserCheck, AlertCircle, Calendar, Clock, MapPin, Trash2, ArrowRight } from 'lucide-react';
import EventDetailModal from '../components/EventDetailModal';

const MyEventsDashboard = ({ userRSVPs, onCancelRSVP, onNavigateToTab, onRSVP }) => {
  const [activeTab, setActiveTab] = useState('confirmed');
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  const confirmedRSVPs = userRSVPs.filter((r) => r.status === 'confirmed');
  const waitlistedRSVPs = userRSVPs.filter((r) => r.status === 'waitlisted');

  const currentList = activeTab === 'confirmed' ? confirmedRSVPs : waitlistedRSVPs;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My RSVPs & Event Passes</h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Manage your registered campus events and track waitlist queue status</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('catalog')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Explore Event Catalog <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-800 max-w-md">
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'confirmed'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Confirmed Passes ({confirmedRSVPs.length})
          </button>

          <button
            onClick={() => setActiveTab('waitlisted')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'waitlisted'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Waitlisted Queue ({waitlistedRSVPs.length})
          </button>
        </div>
      </div>

      {/* RSVPs Grid */}
      {currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((rsvp) => {
            const event = rsvp.event;
            if (!event) return null;

            return (
              <div key={rsvp._id} className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800">
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-brand-300 border border-brand-500/20">
                      {event.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      rsvp.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {rsvp.status === 'confirmed' ? <UserCheck className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {rsvp.status === 'confirmed' ? 'Confirmed' : 'Waitlisted'}
                    </span>
                  </div>

                  <div>
                    <h3
                      onClick={() => setSelectedEventModal(event)}
                      className="text-lg font-bold text-white hover:text-brand-300 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{event.description}</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedEventModal(event)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onCancelRSVP(event._id)}
                    className="py-2 px-3 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center border border-slate-800 text-slate-500">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {activeTab === 'confirmed' ? 'No Confirmed RSVPs Yet' : 'No Waitlisted Events'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {activeTab === 'confirmed'
              ? "You haven't registered for any campus events yet. Explore upcoming fests and workshops!"
              : 'You do not have any waitlisted event passes right now.'}
          </p>
          <button
            onClick={() => onNavigateToTab('catalog')}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-lg"
          >
            Browse Upcoming Events
          </button>
        </div>
      )}

      {/* Modal View */}
      <EventDetailModal
        event={selectedEventModal}
        userRSVPStatus={selectedEventModal ? activeTab : null}
        isOpen={!!selectedEventModal}
        onClose={() => setSelectedEventModal(null)}
        onRSVP={onRSVP}
        onCancelRSVP={onCancelRSVP}
      />
    </div>
  );
};

export default MyEventsDashboard;
