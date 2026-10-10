import React, { useState, useEffect } from 'react';
import { Shield, Plus, Calendar, Users, AlertCircle, Edit3, Trash2, ShieldCheck, GraduationCap, RefreshCw, QrCode, CheckCircle2, TrendingUp, PieChart } from 'lucide-react';
import API from '../services/api';
import QRScannerModal from '../components/QRScannerModal';

const AdminDashboard = ({ onOpenCreateModal, onEditEvent, onDeleteEvent, onViewAttendees }) => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/events?limit=100'),
      ]);
      setStats(statsRes.data);
      setEvents(eventsRes.data.events || []);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="surface-card rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#09090B] text-[#A3E635] flex items-center justify-center border border-[#27272A]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#FAFAFA]">EventSphere Admin Portal</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#27272A] text-[#A3E635] border border-[#3F3F46]">
                  Management
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] font-medium">Manage event schedules, capacities, attendee rosters, and waitlists</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAdminData}
              title="Refresh Data"
              className="p-2 rounded-xl bg-[#09090B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#27272A] transition-colors"
              aria-label="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] border border-[#3F3F46] transition-all shadow-sm active:scale-95"
            >
              <QrCode className="w-4 h-4 text-[#A3E635]" />
              Scan QR Check-in
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B] transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-[#27272A]">
          <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#18181B] text-[#A3E635] flex items-center justify-center border border-[#27272A]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#FAFAFA]">{stats?.totalEvents || events.length}</p>
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Total Events</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#18181B] text-[#A3E635] flex items-center justify-center border border-[#27272A]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#FAFAFA]">{stats?.totalRSVPs || 0}</p>
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Active Passes</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#18181B] text-[#A3E635] flex items-center justify-center border border-[#27272A]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#A3E635]">{stats?.totalCheckedIn || 0}</p>
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Check-ins</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#18181B] text-emerald-400 flex items-center justify-center border border-[#27272A]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#FAFAFA]">
                {stats?.attendanceRate !== undefined ? `${stats.attendanceRate}%` : '0%'}
              </p>
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Att. Rate</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#18181B] text-amber-400 flex items-center justify-center border border-[#27272A]">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#FAFAFA]">{stats?.totalWaitlist || 0}</p>
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Waitlist Queue</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#18181B] text-zinc-300 flex items-center justify-center border border-[#27272A]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#FAFAFA]">{stats?.totalStudents || 0}</p>
              <p className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Category Breakdown Section */}
      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className="surface-card rounded-2xl p-5 border border-[#27272A] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#A3E635]" />
              Event Category Breakdown
            </h2>
            <span className="text-xs text-[#A1A1AA]">
              {stats.categoryBreakdown.reduce((acc, curr) => acc + curr.count, 0)} Total Categorized
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {stats.categoryBreakdown.map((item) => {
              const total = stats.totalEvents || 1;
              const pct = Math.round((item.count / total) * 100);

              return (
                <div
                  key={item.category}
                  className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#FAFAFA]">{item.category}</span>
                    <span className="font-extrabold text-[#A3E635]">{item.count} events</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#27272A] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#A3E635] transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Events Management Table */}
      <div className="surface-card rounded-2xl p-5 border border-[#27272A] overflow-hidden space-y-4">
        <h2 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#A3E635]" />
          Platform Event Directory
        </h2>

        {loading ? (
          <div className="text-center py-12 text-[#A1A1AA] text-xs">Loading admin table...</div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272A] text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider bg-[#09090B]/50">
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Capacity & RSVPs</th>
                  <th className="py-3 px-4">Waitlist</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-xs">
                {events.map((event) => {
                  const attendeeCount = event.attendeeCount || 0;
                  const capacity = event.capacity || 1;
                  const waitlistCount = event.waitlistCount || 0;
                  const isFull = attendeeCount >= capacity;

                  return (
                    <tr key={event._id} className="hover:bg-[#27272A]/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#FAFAFA]">
                        <p className="line-clamp-1 text-xs sm:text-sm">{event.title}</p>
                        <p className="text-[11px] text-[#A1A1AA] font-normal">{event.organizer} • {event.location}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#09090B] text-[#FAFAFA] border border-[#27272A]">
                          {event.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#A1A1AA] font-medium">
                        <p className="text-[#FAFAFA]">{new Date(event.date).toLocaleDateString()}</p>
                        <p className="text-[11px] text-[#A1A1AA]">{event.time}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#FAFAFA]">{attendeeCount}</span> / {capacity}
                          {isFull && (
                            <span className="text-[10px] bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded font-bold border border-amber-400/20">
                              Full
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        {waitlistCount > 0 ? (
                          <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-[11px] border border-amber-400/20">
                            {waitlistCount} Queue
                          </span>
                        ) : (
                          <span className="text-zinc-600 font-normal">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewAttendees(event)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#FAFAFA] bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] transition-colors flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#A3E635]" />
                            Roster
                          </button>
                          <button
                            onClick={() => onEditEvent(event)}
                            title="Edit Event"
                            className="p-1.5 text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] rounded-lg transition-colors border border-transparent hover:border-[#3F3F46]"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteEvent(event._id)}
                            title="Delete Event"
                            className="p-1.5 text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/40"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-[#A1A1AA] text-xs">
            No events registered in database.
          </div>
        )}
      </div>

      {/* Admin QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
