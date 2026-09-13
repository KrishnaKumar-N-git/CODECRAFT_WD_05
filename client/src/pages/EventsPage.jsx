import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/event/EventCard';
import CreateEventModal from '../components/event/CreateEventModal';
import { Calendar, Plus, Loader2 } from 'lucide-react';

const EventsPage = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventDeleted = (id) => {
    setEvents(events.filter((e) => e._id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header (Card 11) */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-blue-600" /> Events
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover and join college events.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Events Grid (Card 11) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard key={event._id} event={event} onEventDeleted={handleEventDeleted} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-white border border-slate-200 p-8 space-y-3 shadow-sm">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No upcoming events</h3>
          <p className="text-xs text-slate-500">Be the first club or student to schedule an event!</p>
        </div>
      )}

      {/* Modal */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onEventCreated={() => fetchEvents()}
      />
    </div>
  );
};

export default EventsPage;
