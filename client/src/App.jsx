import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EventListings from './pages/EventListings';
import MyEventsDashboard from './pages/MyEventsDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventFormModal from './components/EventFormModal';
import AttendeeListModal from './components/AttendeeListModal';
import Toast from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import API from './services/api';

const AppContent = () => {
  const { user, isAdmin, isStudent } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [userRSVPs, setUserRSVPs] = useState([]);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [attendeesModalEvent, setAttendeesModalEvent] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // Fetch logged in user's RSVPs (Student only)
  const fetchUserRSVPs = async () => {
    if (!user || !isStudent) {
      setUserRSVPs([]);
      return;
    }
    try {
      const { data } = await API.get('/rsvp/my-events');
      setUserRSVPs(data || []);
    } catch (err) {
      console.error('Error fetching user RSVPs:', err);
    }
  };

  useEffect(() => {
    fetchUserRSVPs();
  }, [user, isStudent]);

  // Handle RSVP action
  const handleRSVP = async (eventId) => {
    if (!user) {
      setActiveTab('login');
      showToast('info', 'Please sign in to RSVP for campus events');
      return;
    }

    try {
      const { data } = await API.post(`/events/${eventId}/rsvp`);
      showToast(
        data.rsvp.status === 'confirmed' ? 'success' : 'info',
        data.message
      );
      fetchUserRSVPs();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to RSVP');
    }
  };

  // Handle RSVP cancellation
  const handleCancelRSVP = async (eventId) => {
    try {
      const { data } = await API.delete(`/events/${eventId}/rsvp`);
      showToast('info', data.message);
      fetchUserRSVPs();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  // Handle Admin Create / Edit Event Form Submit
  const handleSaveEvent = async (formData, eventId) => {
    try {
      if (eventId) {
        await API.put(`/events/${eventId}`, formData);
        showToast('success', 'Event updated successfully!');
      } else {
        await API.post('/events', formData);
        showToast('success', 'New campus event created successfully!');
      }
      setCreateModalOpen(false);
      setEditingEvent(null);
      // Reload current tab
      if (activeTab === 'catalog') {
        window.location.reload();
      } else {
        setActiveTab('catalog');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Error saving event');
    }
  };

  // Handle Admin Delete Event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also remove all student RSVPs.')) {
      return;
    }
    try {
      await API.delete(`/events/${eventId}`);
      showToast('success', 'Event deleted successfully');
      window.location.reload();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete event');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-zinc-100 font-sans selection:bg-lime-400 selection:text-black">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => { setEditingEvent(null); setCreateModalOpen(true); }}
      />

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'catalog' && (
          <EventListings
            onRSVP={handleRSVP}
            onCancelRSVP={handleCancelRSVP}
            userRSVPs={userRSVPs}
            onOpenCreateModal={() => { setEditingEvent(null); setCreateModalOpen(true); }}
            onEditEvent={(evt) => { setEditingEvent(evt); setCreateModalOpen(true); }}
            onDeleteEvent={handleDeleteEvent}
            onViewAttendees={(evt) => setAttendeesModalEvent(evt)}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'my-events' && (
          isStudent ? (
            <MyEventsDashboard
              userRSVPs={userRSVPs}
              onCancelRSVP={handleCancelRSVP}
              onNavigateToTab={setActiveTab}
              onRSVP={handleRSVP}
            />
          ) : (
            <div className="text-center py-20 bg-[#18181B] rounded-2xl p-8 max-w-lg mx-auto space-y-4 border border-zinc-800">
              <h2 className="text-xl font-bold text-amber-400">Student Feature Only</h2>
              <p className="text-xs text-zinc-400">
                The "My RSVPs" dashboard is reserved for student users. Administrators manage events via the Admin Portal.
              </p>
              <button
                onClick={() => setActiveTab('admin')}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-all"
              >
                Go to Admin Portal
              </button>
            </div>
          )
        )}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard
              onOpenCreateModal={() => { setEditingEvent(null); setCreateModalOpen(true); }}
              onEditEvent={(evt) => { setEditingEvent(evt); setCreateModalOpen(true); }}
              onDeleteEvent={handleDeleteEvent}
              onViewAttendees={(evt) => setAttendeesModalEvent(evt)}
            />
          ) : (
            <div className="text-center py-20 bg-[#18181B] rounded-2xl p-8 max-w-lg mx-auto space-y-4 border border-zinc-800">
              <h2 className="text-xl font-bold text-rose-400">Access Restricted</h2>
              <p className="text-sm text-zinc-400">You must be signed in with an Administrator account to access the control panel.</p>
              <button
                onClick={() => setActiveTab('login')}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-lime-400 text-black hover:bg-lime-300 transition-all"
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}

        {activeTab === 'login' && (
          <LoginPage
            onNavigateToRegister={() => setActiveTab('register')}
            onSuccess={() => { setActiveTab('catalog'); showToast('success', 'Signed in successfully'); }}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPage
            onNavigateToLogin={() => setActiveTab('login')}
            onSuccess={() => { setActiveTab('catalog'); showToast('success', 'Account created successfully'); }}
          />
        )}
      </main>

      {/* Admin Event Form Modal (Create / Edit) */}
      <EventFormModal
        isOpen={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setEditingEvent(null); }}
        onSubmit={handleSaveEvent}
        initialData={editingEvent}
      />

      {/* Admin Attendee List Modal */}
      <AttendeeListModal
        isOpen={!!attendeesModalEvent}
        onClose={() => setAttendeesModalEvent(null)}
        event={attendeesModalEvent}
      />

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 bg-[#09090B] mt-16 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400"></span>
            <p className="font-medium text-zinc-400">EventSphere: Smart Event Management and Engagement Platform</p>
          </div>
          <div className="flex items-center gap-5 text-zinc-400 font-medium">
            <button onClick={() => setActiveTab('catalog')} className="hover:text-lime-400 transition-colors">Catalog</button>
            {isStudent && (
              <button onClick={() => setActiveTab('my-events')} className="hover:text-lime-400 transition-colors">My RSVPs</button>
            )}
            <button onClick={() => setActiveTab('admin')} className="hover:text-lime-400 transition-colors">Admin Portal</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  </AuthProvider>
);

export default App;
