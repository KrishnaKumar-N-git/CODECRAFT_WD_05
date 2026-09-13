import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Users, Check, Plus, Trash2 } from 'lucide-react';

const EventCard = ({ event, onEventDeleted }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [isAttending, setIsAttending] = useState(
    event.isAttending || (user && event.attendees?.some((a) => (a._id || a) === user._id)) || false
  );
  const [attendeesCount, setAttendeesCount] = useState(event.attendeesCount || 0);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  const isOrganizer = user && event.organizer && (user._id === event.organizer._id || user._id === event.organizer);
  const canDelete = isOrganizer || isAdmin;

  const handleToggleRsvp = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to RSVP for events.');
      return;
    }
    if (rsvpLoading) return;

    try {
      setRsvpLoading(true);
      const res = await api.post(`/events/${event._id}/rsvp`);
      if (res.data.success) {
        setIsAttending(res.data.isAttending);
        setAttendeesCount(res.data.attendeesCount);
        if (res.data.isAttending) {
          toast.success('RSVP confirmed! See you there! 🎉');
        } else {
          toast.success('RSVP removed.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update RSVP.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const res = await api.delete(`/events/${event._id}`);
      if (res.data.success) {
        toast.success('Event deleted.');
        if (onEventDeleted) onEventDeleted(event._id);
      }
    } catch (err) {
      toast.error('Failed to delete event.');
    }
  };

  const eventDate = new Date(event.date);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col sm:flex-row group">
      {/* Event Image Banner (Card 11 Left) */}
      <div className="sm:w-64 h-48 sm:h-auto shrink-0 relative overflow-hidden bg-slate-100">
        <img
          src={
            event.image ||
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=500&fit=crop'
          }
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {canDelete && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition cursor-pointer"
            title="Delete event"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content (Card 11 Right) */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition">
            {event.title}
          </h3>

          <div className="space-y-1.5 mt-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-800">
                {eventDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{event.location || 'College Auditorium'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Organized by {event.organizer?.department || event.organizer?.fullName || 'CSE Department'}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {event.description || 'A celebration of innovation and technology.'}
          </p>
        </div>

        {/* Footer: RSVP button (Card 11: [Join Event]) */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">
            {attendeesCount} student{attendeesCount === 1 ? '' : 's'} attending
          </span>

          <button
            onClick={handleToggleRsvp}
            disabled={rsvpLoading}
            className={`w-full sm:w-auto px-6 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              isAttending
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
            }`}
          >
            {isAttending ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Attending</span>
              </>
            ) : (
              <span>Join Event</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
