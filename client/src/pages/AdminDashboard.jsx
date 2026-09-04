import React, { useState, useEffect } from 'react';
import { Shield, PlusCircle, Calendar, Users, AlertCircle, Edit3, Trash2, ShieldCheck, GraduationCap, RefreshCw } from 'lucide-react';
import API from '../services/api';

const AdminDashboard = ({ onOpenCreateModal, onEditEvent, onDeleteEvent, onViewAttendees }) => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Faculty & Admin Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Full CRUD Access
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Manage event schedules, capacities, attendee rosters, and waitlists</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              title="Refresh Data"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Event
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats?.totalEvents || events.length}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Total Events</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats?.totalRSVPs || 0}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Active RSVPs</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats?.totalWaitlist || 0}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Waitlist Queue</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stats?.totalStudents || 0}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Management Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl overflow-hidden space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Campus Event Directory
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading admin table...</div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">
                  <th className="py-3.5 px-4">Event Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Capacity & RSVPs</th>
                  <th className="py-3.5 px-4">Waitlist</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {events.map((event) => {
                  const attendeeCount = event.attendeeCount || 0;
                  const capacity = event.capacity || 1;
                  const waitlistCount = event.waitlistCount || 0;
                  const isFull = attendeeCount >= capacity;

                  return (
                    <tr key={event._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        <p className="line-clamp-1 text-sm">{event.title}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{event.organizer} • {event.location}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-brand-300 border border-brand-500/20">
                          {event.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-medium">
                        <p>{new Date(event.date).toLocaleDateString()}</p>
                        <p className="text-[11px] text-slate-400">{event.time}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{attendeeCount}</span> / {capacity}
                          {isFull && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold">
                              Full
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold">
                        {waitlistCount > 0 ? (
                          <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            {waitlistCount} Waiting
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">None</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewAttendees(event)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/50 hover:bg-purple-900/80 border border-purple-800/50 transition-colors flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Roster
                          </button>
                          <button
                            onClick={() => onEditEvent(event)}
                            title="Edit Event"
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteEvent(event._id)}
                            title="Delete Event"
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
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
          <div className="text-center py-12 text-slate-400 text-sm">
            No events registered in database.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
