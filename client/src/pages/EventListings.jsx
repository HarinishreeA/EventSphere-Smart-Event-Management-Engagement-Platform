import React, { useState, useEffect } from 'react';
import API from '../services/api';
import EventCard from '../components/EventCard';
import EventFilter from '../components/EventFilter';
import Pagination from '../components/Pagination';
import EventDetailModal from '../components/EventDetailModal';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Calendar, Users, Award, ShieldAlert } from 'lucide-react';

const EventListings = ({
  onRSVP,
  onCancelRSVP,
  userRSVPs,
  onOpenCreateModal,
  onEditEvent,
  onDeleteEvent,
  onViewAttendees,
  onNavigateToTab,
}) => {
  const { user } = useAuth();
  const { eventUpdates } = useSocket();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const { data } = await API.get('/events', { params });
      setEvents(data.events || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching events catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, limit, selectedCategory, searchQuery]);

  // Handle Socket real-time updates for live attendee counts
  useEffect(() => {
    if (Object.keys(eventUpdates).length > 0) {
      setEvents((prevEvents) =>
        prevEvents.map((evt) => {
          const update = eventUpdates[evt._id];
          if (update) {
            return {
              ...evt,
              attendeeCount: update.attendeeCount,
              waitlistCount: update.waitlistCount,
              capacity: update.capacity,
            };
          }
          return evt;
        })
      );
    }
  }, [eventUpdates]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPage(1);
  };

  // Map user RSVP status by event ID
  const rsvpMap = userRSVPs.reduce((acc, rsvp) => {
    if (rsvp.event && rsvp.event._id) {
      acc[rsvp.event._id] = rsvp.status;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      
      {/* Hero Banner Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-brand-500/20 shadow-2xl">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-brand-400" />
            Live Real-Time Attendee Updates Enabled
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Discover & RSVP to <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Campus Events Today
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
            Browse upcoming technical symposiums, coding hackathons, guest lectures, cultural galas, and sports meets. Experience real-time live capacity tracking and automated waitlisting.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-slate-300 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>{total} Total Events</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Instant Confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Auto Waitlist Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <EventFilter
        searchQuery={searchQuery}
        setSearchQuery={(val) => { setSearchQuery(val); setPage(1); }}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => { setSelectedCategory(cat); setPage(1); }}
        onReset={handleResetFilters}
      />

      {/* Main Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl h-96 animate-pulse p-6 space-y-4">
              <div className="h-40 bg-slate-800 rounded-xl" />
              <div className="h-6 bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                userRSVPStatus={rsvpMap[event._id]}
                onRSVP={onRSVP}
                onCancelRSVP={onCancelRSVP}
                onViewDetails={(evt) => setSelectedEventForModal(evt)}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                onViewAttendees={onViewAttendees}
                isSocketUpdated={!!eventUpdates[event._id]}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            page={page}
            pages={pages}
            total={total}
            limit={limit}
            onPageChange={(p) => setPage(p)}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
          />
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center border border-slate-800 text-slate-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Events Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            We couldn't find any campus events matching your criteria. Try adjusting your search query or category filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-lg"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Detailed Modal Popup */}
      <EventDetailModal
        event={selectedEventForModal}
        userRSVPStatus={selectedEventForModal ? rsvpMap[selectedEventForModal._id] : null}
        isOpen={!!selectedEventForModal}
        onClose={() => setSelectedEventForModal(null)}
        onRSVP={onRSVP}
        onCancelRSVP={onCancelRSVP}
      />
    </div>
  );
};

export default EventListings;
