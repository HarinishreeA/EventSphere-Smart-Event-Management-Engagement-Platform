import React, { useState, useEffect, useMemo } from 'react';
import API from '../services/api';
import EventCard from '../components/EventCard';
import EventFilter from '../components/EventFilter';
import Pagination from '../components/Pagination';
import EventDetailModal from '../components/EventDetailModal';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Users,
  Layers,
  Sparkles,
  Zap,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  HelpCircle,
} from 'lucide-react';

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
  const { user, isStudent } = useAuth();
  const { eventUpdates } = useSocket();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);

  // Calculate date range ISO strings for backend filtering
  const getDateRangeParams = (rangeType) => {
    if (rangeType === 'all') return {};
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    if (rangeType === 'today') {
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
      return { startDate: startOfToday, endDate: endOfToday };
    }
    if (rangeType === 'week') {
      const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return { startDate: startOfToday, endDate: weekAhead };
    }
    if (rangeType === 'month') {
      const monthAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      return { startDate: startOfToday, endDate: monthAhead };
    }
    return {};
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const dateParams = getDateRangeParams(selectedDateRange);
      const params = {
        page,
        limit,
        ...dateParams,
      };

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;

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
  }, [page, limit, selectedCategory, selectedStatus, selectedDateRange, searchQuery]);

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
    setSelectedStatus('');
    setSelectedDateRange('all');
    setPage(1);
  };

  // Map user RSVP status by event ID
  const rsvpMap = useMemo(() => {
    return userRSVPs.reduce((acc, rsvp) => {
      if (rsvp.event && rsvp.event._id) {
        acc[rsvp.event._id] = rsvp.status;
      }
      return acc;
    }, {});
  }, [userRSVPs]);

  // Derive imminent upcoming featured events for the Spotlight section
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => new Date(e.date) >= new Date(Date.now() - 24 * 60 * 60 * 1000))
      .slice(0, 2);
  }, [events]);

  return (
    <div className="space-y-10">
      
      {/* 1. Discover Events Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#18181B] to-[#09090B] border border-[#27272A] p-6 sm:p-10 lg:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        {/* Subtle decorative lime radial backdrop */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#A3E635]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Platform pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#27272A]/80 border border-[#3F3F46] text-[#A3E635] text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>Smart Campus Event Discovery & Real-Time Sync</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#FAFAFA] tracking-tight leading-tight">
              Discover Events
            </h1>
            <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl leading-relaxed">
              Explore technical workshops, cultural showcases, hackathons, and guest lectures across campus. Reserve your spot with instant capacity locks and smart waitlists.
            </p>
          </div>

          {/* Key Platform Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#27272A]/80">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#09090B]/80 border border-[#27272A]">
              <div className="p-2 rounded-lg bg-[#18181B] text-[#A3E635]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#FAFAFA]">{total} Events</p>
                <p className="text-[10px] text-[#A1A1AA]">Active Catalog</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#09090B]/80 border border-[#27272A]">
              <div className="p-2 rounded-lg bg-[#18181B] text-[#A3E635]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#FAFAFA]">Live RSVPs</p>
                <p className="text-[10px] text-[#A1A1AA]">Real-Time Capacity</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-3 p-3 rounded-xl bg-[#09090B]/80 border border-[#27272A]">
              <div className="p-2 rounded-lg bg-[#18181B] text-[#A3E635]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#FAFAFA]">Auto-Waitlist</p>
                <p className="text-[10px] text-[#A1A1AA]">Instant Promotions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Events Spotlight Section (when available and on page 1) */}
      {page === 1 && !loading && upcomingEvents.length > 0 && selectedCategory === 'All' && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#A3E635]/10 border border-[#A3E635]/20 text-[#A3E635]">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA]">Next Up on Campus</h2>
                <p className="text-xs text-[#A1A1AA]">Imminent upcoming events starting soon</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((evt) => (
              <div
                key={`featured-${evt._id}`}
                className="surface-card rounded-2xl p-5 sm:p-6 border border-[#27272A] hover:border-[#A3E635]/50 transition-all group relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div
                    onClick={() => setSelectedEventForModal(evt)}
                    className="relative w-full sm:w-44 h-36 rounded-xl overflow-hidden bg-[#18181B] shrink-0 cursor-pointer"
                  >
                    <img
                      src={evt.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#09090B]/90 text-[#FAFAFA] border border-[#27272A]">
                        {evt.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A3E635] mb-1">
                        <Clock className="w-3 h-3" />
                        {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {evt.time}
                      </span>
                      <h3
                        onClick={() => setSelectedEventForModal(evt)}
                        className="text-base font-bold text-[#FAFAFA] group-hover:text-[#A3E635] transition-colors truncate cursor-pointer"
                      >
                        {evt.title}
                      </h3>
                      <p className="text-xs text-[#A1A1AA] line-clamp-2 mt-1">
                        {evt.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
                      <span className="text-xs text-[#A1A1AA] flex items-center gap-1 truncate">
                        <Users className="w-3 h-3 text-[#A3E635]" />
                        <strong className="text-[#FAFAFA]">{evt.attendeeCount || 0}</strong> / {evt.capacity} seats
                      </span>

                      <button
                        onClick={() => setSelectedEventForModal(evt)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#09090B] bg-[#A3E635] hover:bg-[#84CC16] transition-all shadow-sm"
                      >
                        Details & RSVP
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Event Filters & Controls */}
      <EventFilter
        searchQuery={searchQuery}
        setSearchQuery={(val) => { setSearchQuery(val); setPage(1); }}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => { setSelectedCategory(cat); setPage(1); }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(st) => { setSelectedStatus(st); setPage(1); }}
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={(dr) => { setSelectedDateRange(dr); setPage(1); }}
        onReset={handleResetFilters}
      />

      {/* 4. Events Catalog Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#A3E635]" />
            <h2 className="text-lg font-bold text-[#FAFAFA]">All Events Catalog</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
              {total}
            </span>
          </div>
        </div>

        {loading ? (
          /* Polished Skeleton Loaders */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="surface-card rounded-2xl h-[460px] animate-pulse p-5 space-y-4 border border-[#27272A] flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-48 bg-[#27272A]/70 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-5 bg-[#27272A] rounded w-3/4" />
                    <div className="h-3 bg-[#27272A]/60 rounded w-1/3" />
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="h-3 bg-[#27272A]/40 rounded w-full" />
                    <div className="h-3 bg-[#27272A]/40 rounded w-4/5" />
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#27272A]">
                  <div className="h-2 bg-[#27272A] rounded-full w-full" />
                  <div className="h-10 bg-[#27272A] rounded-xl" />
                </div>
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
          /* Polished Empty State */
          <div className="surface-card rounded-3xl p-12 text-center space-y-5 border border-[#27272A] max-w-xl mx-auto my-8 shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
            <div className="w-16 h-16 rounded-2xl bg-[#18181B] border border-[#27272A] mx-auto flex items-center justify-center text-[#A3E635]">
              <Search className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#FAFAFA]">No Events Found</h3>
              <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
                We couldn't find any events matching your selected criteria. Try adjusting your search keywords, category, or date range.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B] transition-all shadow-sm"
              >
                Clear All Filters
              </button>
              {isStudent && (
                <button
                  onClick={() => onNavigateToTab('my-events')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] border border-[#27272A] transition-all"
                >
                  View My Registered Passes
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. Detailed Modal Popup */}
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
