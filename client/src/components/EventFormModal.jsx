import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Edit3, Image as ImageIcon } from 'lucide-react';

const categories = ['Fest', 'Workshop', 'Guest Lecture', 'Competition', 'Cultural', 'Sports', 'Other'];

const EventFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fest');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [capacity, setCapacity] = useState(50);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'Fest');
      setDate(initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '');
      setTime(initialData.time || '');
      setLocation(initialData.location || '');
      setOrganizer(initialData.organizer || '');
      setCapacity(initialData.capacity || 50);
      setImageUrl(initialData.imageUrl || '');
      setImageFile(null);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Fest');
      setDate('');
      setTime('');
      setLocation('');
      setOrganizer('');
      setCapacity(50);
      setImageUrl('');
      setImageFile(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('location', location);
    formData.append('organizer', organizer);
    formData.append('capacity', capacity);

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (imageUrl) {
      formData.append('imageUrl', imageUrl);
    }

    try {
      await onSubmit(formData, initialData?._id);
      onClose();
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/85 backdrop-blur-md animate-fade-in">
      <div className="surface-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#27272A] shadow-2xl p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272A] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#09090B] text-[#A3E635] flex items-center justify-center border border-[#27272A]">
              {initialData ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#FAFAFA]">
                {initialData ? 'Edit Event Details' : 'Create New Event'}
              </h2>
              <p className="text-xs text-[#A1A1AA] font-medium">Configure event logistics, capacity limits, and banner</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual AI & Hackathon Symposium 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#18181B] text-[#FAFAFA]">{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
                Capacity Limit (Max Spots) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe event schedule, requirements, keynote highlights..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
                Event Time *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 10:00 AM - 01:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
                Location / Venue *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Auditorium Hall 2"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
                Organizer / Host Department *
              </label>
              <input
                type="text"
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. Computer Science Society"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
              />
            </div>
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Event Banner (Upload File or URL)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => { setImageUrl(e.target.value); setImageFile(null); }}
                  placeholder="Paste Image URL (Unsplash, CDN...)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-[#FAFAFA] text-xs focus:ring-1 focus:ring-[#A3E635] focus:border-[#A3E635] focus:outline-none"
                />
              </div>

              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#09090B] border border-dashed border-[#27272A] hover:border-[#A3E635] text-xs font-semibold text-[#FAFAFA] cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#A3E635]" />
                <span className="truncate">{imageFile ? imageFile.name : 'Upload Local Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                      setImageUrl('');
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#27272A]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-xs text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl font-bold text-xs bg-[#A3E635] hover:bg-[#84CC16] text-[#09090B] transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              {loading ? (
                <span>Saving...</span>
              ) : initialData ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" /> Save Changes
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
