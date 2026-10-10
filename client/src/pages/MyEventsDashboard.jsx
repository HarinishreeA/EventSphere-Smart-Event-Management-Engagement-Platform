import React, { useState, useMemo, useEffect } from 'react';
import {
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  ArrowRight,
  Sparkles,
  User,
  History,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  QrCode,
  Trophy,
  Award,
} from 'lucide-react';
import EventDetailModal from '../components/EventDetailModal';
import DigitalPassModal from '../components/DigitalPassModal';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const defaultImage =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

const MyEventsDashboard = ({ userRSVPs, onCancelRSVP, onNavigateToTab, onRSVP }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [selectedPassEvent, setSelectedPassEvent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);
        const res = await API.get('/auth/leaderboard');
        setLeaderboard(res.data || []);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        const res = await API.get('/rsvp/my-history');
        setHistory(res.data || []);
      } catch (err) {
        console.error('Failed to load attendance history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  // Compute segmented lists using existing RSVP data
  const {
    confirmedRSVPs,
    waitlistedRSVPs,
    upcomingConfirmed,
    pastEvents,
    allValidRSVPs,
  } = useMemo(() => {
    const valid = userRSVPs.filter((r) => r.event && r.event._id);
    const confirmed = valid.filter((r) => r.status === 'confirmed');
    const waitlisted = valid.filter((r) => r.status === 'waitlisted');

    const now = new Date(Date.now() - 24 * 60 * 60 * 1000); // within last 24h still considered recent/upcoming
    const upcoming = confirmed.filter((r) => new Date(r.event.date) >= now);
    const past = valid.filter((r) => new Date(r.event.date) < now);

    return {
      confirmedRSVPs: confirmed,
      waitlistedRSVPs: waitlisted,
      upcomingConfirmed: upcoming,
      pastEvents: past,
      allValidRSVPs: valid,
    };
  }, [userRSVPs]);

  // Current display list based on active tab
  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingConfirmed;
      case 'waitlisted':
        return waitlistedRSVPs;
      case 'past':
        return pastEvents;
      case 'all':
      default:
        return allValidRSVPs;
    }
  }, [activeTab, upcomingConfirmed, waitlistedRSVPs, pastEvents, allValidRSVPs]);

  return (
    <div className="space-y-8">
      
      {/* 1. Welcome & Profile Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#18181B] to-[#09090B] border border-[#27272A] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        {/* Subtle radial lime highlight */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A3E635]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#27272A] border border-[#3F3F46] text-xs font-semibold text-[#A3E635]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Participation Hub</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#FAFAFA] tracking-tight">
              Welcome back, {user?.name || 'Student'} 👋
            </h1>

            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl leading-relaxed">
              Track your upcoming campus event reservations, live waitlist queue positions, and past participation history.
            </p>

            {user?.department && (
              <div className="flex items-center gap-3 pt-1 text-xs text-[#71717A]">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <User className="w-3.5 h-3.5 text-[#A3E635]" />
                  {user.department} {user.studentId ? `• ID: ${user.studentId}` : ''}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateToTab('catalog')}
            className="self-start md:self-center flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B] transition-all shadow-sm shrink-0"
          >
            Discover More Events
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Participation Overview Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Registered */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Total Registered</span>
            <div className="p-2 rounded-xl bg-[#09090B] text-zinc-300 border border-[#27272A]">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#FAFAFA]">{allValidRSVPs.length}</p>
          <p className="text-[11px] text-[#71717A]">All-time registrations</p>
        </div>

        {/* Stat 2: Confirmed Passes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Confirmed Passes</span>
            <div className="p-2 rounded-xl bg-[#09090B] text-[#A3E635] border border-[#27272A]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#A3E635]">{confirmedRSVPs.length}</p>
          <p className="text-[11px] text-[#71717A]">Active reserved seats</p>
        </div>

        {/* Stat 3: Waitlisted Events */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Waitlist Queue</span>
            <div className="p-2 rounded-xl bg-[#09090B] text-amber-400 border border-[#27272A]">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{waitlistedRSVPs.length}</p>
          <p className="text-[11px] text-[#71717A]">Auto-FIFO promotion</p>
        </div>

        {/* Stat 4: Upcoming Events */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">Upcoming</span>
            <div className="p-2 rounded-xl bg-[#09090B] text-[#A3E635] border border-[#27272A]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#FAFAFA]">{upcomingConfirmed.length}</p>
          <p className="text-[11px] text-[#71717A]">Scheduled ahead</p>
        </div>
      </div>

      {/* 3. Segmented Navigation Tabs */}
      <div className="surface-card rounded-2xl p-2 border border-[#27272A] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-[#A3E635] text-[#09090B] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Upcoming Confirmed ({upcomingConfirmed.length})
          </button>

          <button
            onClick={() => setActiveTab('waitlisted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'waitlisted'
                ? 'bg-amber-400 text-[#09090B] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Waitlist Queue ({waitlistedRSVPs.length})
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'past'
                ? 'bg-[#27272A] text-[#FAFAFA] border border-[#3F3F46]'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Past Events ({pastEvents.length})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-[#27272A] text-[#FAFAFA] border border-[#3F3F46]'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Registrations ({allValidRSVPs.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#A3E635] text-[#09090B] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Attendance History
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-[#A3E635] text-[#09090B] shadow-sm'
                : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard
          </button>
        </div>
      </div>

      {/* 4. Display Content (History OR Leaderboard OR RSVPs Grid) */}
      {activeTab === 'history' ? (
        <div className="surface-card rounded-2xl border border-[#27272A] overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#A3E635]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA]">Attendance & Participation History</h2>
                <p className="text-xs text-[#A1A1AA]">Verified event check-ins and earned participation points</p>
              </div>
            </div>
          </div>

          {loadingHistory ? (
            <div className="text-center py-12 text-[#A1A1AA] text-xs">
              Loading attendance history...
            </div>
          ) : history.length === 0 ? (
            <div className="surface-card rounded-3xl p-12 text-center space-y-4 border border-[#27272A] max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#09090B] mx-auto flex items-center justify-center border border-[#27272A] text-[#A3E635]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-[#FAFAFA]">No Attendance History Yet</h3>
                <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto leading-relaxed">
                  You haven't checked in to any campus events yet. Present your digital pass QR code at event venues to earn points & badges!
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('catalog')}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B] shadow-sm transition-all inline-flex items-center gap-2"
              >
                Browse Upcoming Events
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#A1A1AA]">
                <thead className="bg-[#09090B] text-[#71717A] uppercase text-[10px] tracking-wider border-b border-[#27272A]">
                  <tr>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Event Date</th>
                    <th className="py-3 px-4">Check-in Time</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Points Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  {history.map((item) => {
                    const event = item.event;
                    const eventDateStr = event?.date
                      ? new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A';
                    const checkInTimeStr = item.checkedInAt
                      ? `${new Date(item.checkedInAt).toLocaleDateString()} at ${new Date(item.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'N/A';

                    return (
                      <tr key={item._id} className="hover:bg-[#18181B] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#FAFAFA]">
                          {event?.title || 'Campus Event'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#09090B] text-[#FAFAFA] border border-[#27272A]">
                            {event?.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#A1A1AA]">{eventDateStr}</td>
                        <td className="py-3.5 px-4 text-[#A1A1AA]">{checkInTimeStr}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-lime-950/80 text-[#A3E635] border border-lime-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Attended
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#A3E635]/10 text-[#A3E635] font-extrabold text-xs border border-[#A3E635]/30">
                            +10 Points
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'leaderboard' ? (
        <div className="surface-card rounded-2xl border border-[#27272A] overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#A3E635]">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA]">Student Leaderboard</h2>
                <p className="text-xs text-[#A1A1AA]">Top participating students ranked by event check-ins & participation points</p>
              </div>
            </div>
          </div>

          {loadingLeaderboard ? (
            <div className="text-center py-12 text-[#A1A1AA] text-xs">
              Loading leaderboard rankings...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 text-[#A1A1AA] text-xs">
              No leaderboard rankings available yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#A1A1AA]">
                <thead className="bg-[#09090B] text-[#71717A] uppercase text-[10px] tracking-wider border-b border-[#27272A]">
                  <tr>
                    <th className="py-3 px-4 text-center w-16">Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-center">Badges</th>
                    <th className="py-3 px-4 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]">
                  {leaderboard.map((student, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user && (user._id === student._id || user.name === student.name);

                    return (
                      <tr
                        key={student._id || index}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-[#A3E635]/10 font-medium text-[#FAFAFA]'
                            : 'hover:bg-[#18181B]'
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center font-bold">
                          {rank === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-xs border border-amber-400/30">
                              1
                            </span>
                          ) : rank === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-400/20 text-zinc-300 font-extrabold text-xs border border-zinc-400/30">
                              2
                            </span>
                          ) : rank === 3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-500 font-extrabold text-xs border border-amber-700/30">
                              3
                            </span>
                          ) : (
                            <span className="text-[#71717A]">#{rank}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#FAFAFA]">
                          <div className="flex items-center gap-2">
                            <span>{student.name}</span>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A3E635] text-[#09090B]">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#A1A1AA]">{student.department || 'General'}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#09090B] text-[#FAFAFA] border border-[#27272A] font-medium text-[11px]">
                            <Award className="w-3 h-3 text-[#A3E635]" />
                            {student.badges ? student.badges.length : 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-[#A3E635] text-sm">
                          {student.points || 0} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((rsvp) => {
            const event = rsvp.event;
            if (!event) return null;

            const isPast = new Date(event.date) < new Date(Date.now() - 24 * 60 * 60 * 1000);
            const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={rsvp._id}
                className={`surface-card rounded-2xl overflow-hidden flex flex-col justify-between border border-[#27272A] hover:border-[#A3E635]/40 hover:-translate-y-1 transition-all duration-300 shadow-sm ${
                  isPast ? 'opacity-85' : ''
                }`}
              >
                <div>
                  {/* Event Media Banner */}
                  <div
                    className="relative h-44 overflow-hidden bg-[#18181B] cursor-pointer"
                    onClick={() => setSelectedEventModal(event)}
                  >
                    <img
                      src={event.imageUrl || defaultImage}
                      alt={event.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = defaultImage; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-black/40" />

                    {/* Category Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#09090B]/90 text-[#FAFAFA] border border-[#27272A] backdrop-blur-md">
                        {event.category}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5 border ${
                          rsvp.status === 'confirmed'
                            ? 'bg-lime-950/90 text-[#A3E635] border-lime-500/40'
                            : 'bg-amber-950/90 text-amber-400 border-amber-500/40'
                        }`}
                      >
                        {rsvp.status === 'confirmed' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {rsvp.status === 'confirmed' ? 'Pass Confirmed' : 'Waitlisted'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      <h3
                        onClick={() => setSelectedEventModal(event)}
                        className="text-base font-bold text-[#FAFAFA] hover:text-[#A3E635] transition-colors line-clamp-1 cursor-pointer"
                      >
                        {event.title}
                      </h3>
                      <p className="text-[11px] text-[#A1A1AA] flex items-center gap-1.5 mt-1 font-medium">
                        <User className="w-3 h-3 text-[#A3E635] shrink-0" />
                        <span className="truncate">{event.organizer}</span>
                      </p>
                    </div>

                    <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed min-h-[36px]">
                      {event.description}
                    </p>

                    {/* Metadata Grid */}
                    <div className="space-y-2 text-xs text-[#A1A1AA] pt-3 border-t border-[#27272A]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <Calendar className="w-3.5 h-3.5 text-[#A3E635] shrink-0" />
                          <span>{formattedDate}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-[#A1A1AA]">
                          <Clock className="w-3.5 h-3.5 text-[#A3E635] shrink-0" />
                          <span>{event.time}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0 space-y-2">
                  {/* View Digital Pass — confirmed only */}
                  {rsvp.status === 'confirmed' && (
                    <button
                      onClick={() => setSelectedPassEvent(event)}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:brightness-110 active:scale-95"
                      style={{ background: '#A3E635', color: '#09090B' }}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      View Digital Pass
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEventModal(event)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#09090B] hover:bg-[#27272A] text-[#FAFAFA] border border-[#27272A] transition-colors flex items-center justify-center gap-1.5"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onCancelRSVP(event._id)}
                      title={rsvp.status === 'confirmed' ? 'Cancel confirmed pass' : 'Leave waitlist'}
                      className="py-2 px-3 rounded-xl text-xs font-semibold text-rose-300 bg-[#18181B] hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-900/50 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 5. Polished Segmented Empty State */
        <div className="surface-card rounded-3xl p-12 text-center space-y-4 border border-[#27272A] max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#09090B] mx-auto flex items-center justify-center border border-[#27272A] text-[#A3E635]">
            {activeTab === 'upcoming' ? (
              <Calendar className="w-8 h-8" />
            ) : activeTab === 'waitlisted' ? (
              <AlertCircle className="w-8 h-8 text-amber-400" />
            ) : (
              <BookmarkCheck className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-[#FAFAFA]">
              {activeTab === 'upcoming'
                ? 'No Upcoming Confirmed Passes'
                : activeTab === 'waitlisted'
                ? 'No Waitlisted Events'
                : activeTab === 'past'
                ? 'No Past Events Found'
                : 'No Registered Events Yet'}
            </h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto leading-relaxed">
              {activeTab === 'upcoming'
                ? 'You do not have any confirmed event passes scheduled ahead. Explore upcoming campus fests, workshops, and competitions!'
                : activeTab === 'waitlisted'
                ? 'You are not currently in any event waitlists. All your registered passes are confirmed.'
                : activeTab === 'past'
                ? 'You have not attended any completed events yet.'
                : 'You have not registered for any campus events yet. Join campus activities today!'}
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('catalog')}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B] shadow-sm transition-all inline-flex items-center gap-2"
          >
            Browse Upcoming Events
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6. Event Detail Modal */}
      <EventDetailModal
        event={selectedEventModal}
        userRSVPStatus={
          selectedEventModal
            ? userRSVPs.find((r) => r.event && r.event._id === selectedEventModal._id)?.status
            : null
        }
        isOpen={!!selectedEventModal}
        onClose={() => setSelectedEventModal(null)}
        onRSVP={onRSVP}
        onCancelRSVP={onCancelRSVP}
      />

      {/* 7. Digital Pass Modal */}
      <DigitalPassModal
        isOpen={!!selectedPassEvent}
        event={selectedPassEvent}
        onClose={() => setSelectedPassEvent(null)}
      />
    </div>
  );
};

export default MyEventsDashboard;
