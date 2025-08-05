import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, Users, Edit, ToggleLeft, ToggleRight, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../lib/api';
import type { Event } from '../types';
import { formatDate, formatTime } from '../lib/utils';

const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  maxCapacity: z.number().min(1, 'Capacity must be at least 1'),
});

type EventForm = z.infer<typeof eventSchema>;

// EventCard component for reusability
interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onToggle: (eventId: string) => void;
  onDelete: (eventId: string) => void;
}

function EventCard({ event, onEdit, onToggle, onDelete }: EventCardProps) {
  return (
    <div className="bg-gradient-to-br from-nova-purple/20 to-nova-purple/10 backdrop-blur-sm rounded-3xl p-8 border border-nova-cyan/30 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-nova-purple/10">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <h3 className="text-2xl font-bold text-white">{event.name}</h3>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border ${
                event.isActive
                  ? 'bg-green-400/20 text-green-300 border-green-400/30'
                  : 'bg-gray-400/20 text-gray-300 border-gray-400/30'
              }`}
            >
              {event.isActive ? '✓ Active' : '◯ Inactive'}
            </span>
          </div>
          
          {event.description && (
            <p className="text-white/70 mb-6 text-lg">{event.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center text-white">
              <div className="p-2 bg-volleyball-blue/20 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-volleyball-blue" />
              </div>
              <div>
                <p className="text-sm text-white/60">Date</p>
                <p className="font-semibold">{formatDate(event.date)}</p>
              </div>
            </div>
            <div className="flex items-center text-white">
              <div className="p-2 bg-volleyball-orange/20 rounded-lg mr-3">
                <span className="text-volleyball-orange font-bold">⏰</span>
              </div>
              <div>
                <p className="text-sm text-white/60">Time</p>
                <p className="font-semibold">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
              </div>
            </div>
            <div className="flex items-center text-white">
              <div className="p-2 bg-volleyball-purple/20 rounded-lg mr-3">
                <Users className="h-5 w-5 text-volleyball-purple" />
              </div>
              <div>
                <p className="text-sm text-white/60">Participants</p>
                <p className="font-semibold">{event.currentCapacity}/{event.maxCapacity}</p>
              </div>
            </div>
          </div>

          {/* Enhanced Capacity Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Capacity</span>
              <span>{((event.currentCapacity / event.maxCapacity) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-volleyball-orange to-volleyball-orange-dark h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((event.currentCapacity / event.maxCapacity) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => onEdit(event)}
            className="btn-glass p-3"
            title="Edit event details"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onToggle(event.id)}
            className={`btn-glass p-3 ${
              event.isActive 
                ? 'text-green-400 hover:bg-green-400/30' 
                : 'text-gray-400 hover:bg-gray-400/30'
            }`}
            title={event.isActive ? 'Deactivate event (disable check-ins)' : 'Activate event (enable check-ins)'}
          >
            {event.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="btn-danger p-3"
            title="Delete event permanently"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPastEventsExpanded, setIsPastEventsExpanded] = useState(false);
  const [isPastEventsVisible, setIsPastEventsVisible] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents((response.data as any).events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-nova-purple/30"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-nova-purple absolute top-0 left-0"></div>
          </div>
          <p className="text-white font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  const onSubmitEvent = async (data: EventForm) => {
    try {
      if (editingEvent) {
        // Update existing event
        await api.put(`/events/${editingEvent.id}`, data);
      } else {
        // Create new event
        await api.post('/events', data);
      }
      setShowCreateForm(false);
      setEditingEvent(null);
      reset();
      fetchEvents();
    } catch (error: any) {
      console.error('Error saving event:', error);
    }
  };

  const toggleEventStatus = async (eventId: string) => {
    try {
      await api.patch(`/events/${eventId}/toggle`, {});
      fetchEvents();
    } catch (error) {
      console.error('Error toggling event status:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`);
        fetchEvents();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to delete event');
      }
    }
  };

  const startEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowCreateForm(true);
    // Pre-fill the form with event data
    reset({
      name: event.name,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      maxCapacity: event.maxCapacity,
      description: event.description || '',
    });
  };

  // Categorize events
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const upcomingEvents = events.filter(event => event.isActive && event.date >= today);
  const allPastEvents = events.filter(event => event.date < today).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const pastEvents = isPastEventsExpanded ? allPastEvents : allPastEvents.slice(0, 5);
  const disabledEvents = events.filter(event => !event.isActive && event.date >= today);

  return (
    <div className="space-y-8">
      {/* Enhanced Action Bar */}
      <div className="flex justify-end items-center animate-fade-in-up">
        <button
          key="create-event-btn"
          title={showCreateForm ? 'Cancel event creation' : editingEvent ? 'Cancel event editing' : 'Create a new volleyball event'}
          onClick={() => {
            if (showCreateForm) {
              setShowCreateForm(false);
              setEditingEvent(null);
              reset();
            } else {
              setShowCreateForm(true);
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: '#B9E7FE',
            backdropFilter: 'blur(16px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            padding: '16px 32px',
            color: '#4D1F84',
            fontWeight: '600',
            fontSize: '16px',
            boxShadow: '0 8px 32px rgba(185, 231, 254, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            outline: 'none',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#A3D9F2';
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#B9E7FE';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          <Plus className="h-6 w-6" style={{ color: '#4D1F84' }} />
          <span style={{ color: '#4D1F84' }}>
            {showCreateForm ? 'Cancel' : editingEvent ? 'Edit Event' : 'Create Event'}
          </span>
        </button>
      </div>

      {/* Enhanced Create Event Form */}
      {showCreateForm && (
        <div className="bg-gradient-to-br from-nova-cyan/15 to-nova-cyan/5 backdrop-blur-sm rounded-3xl p-8 border border-nova-cyan/30 animate-fade-in-up animation-delay-400 shadow-lg shadow-nova-cyan/10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-nova-cyan to-nova-purple rounded-full mr-3"></div>
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <form onSubmit={handleSubmit(onSubmitEvent)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white mb-2">
                  Event Name *
                </label>
                <input
                  {...register('name')}
                  className="input-modern w-full"
                  placeholder="e.g., Open Gym - Tuesday Night"
                />
                {errors.name && (
                  <p className="text-red-300 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input-modern w-full resize-none"
                  placeholder="Event description..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  {...register('date')}
                  className="input-modern w-full"
                />
                {errors.date && (
                  <p className="text-red-300 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Max Capacity *
                </label>
                <input
                  type="number"
                  {...register('maxCapacity', { valueAsNumber: true })}
                  className="input-modern w-full"
                  min="1"
                  placeholder="Maximum number of participants"
                />
                {errors.maxCapacity && (
                  <p className="text-red-300 text-sm mt-1">{errors.maxCapacity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  {...register('startTime')}
                  className="input-modern w-full"
                />
                {errors.startTime && (
                  <p className="text-red-300 text-sm mt-1">{errors.startTime.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  {...register('endTime')}
                  className="input-modern w-full"
                />
                {errors.endTime && (
                  <p className="text-red-300 text-sm mt-1">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                key="submit-event-btn"
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '1',
                  background: '#B9E7FE',
                  backdropFilter: 'blur(16px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '16px 32px',
                  color: '#4D1F84',
                  fontWeight: '600',
                  fontSize: '16px',
                  boxShadow: '0 8px 32px rgba(185, 231, 254, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? '0.7' : '1'
                }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 mr-2" style={{ borderColor: '#4D1F84' }}></div>
                    <span style={{ color: '#4D1F84' }}>
                      {editingEvent ? 'Updating...' : 'Creating...'}
                    </span>
                  </div>
                ) : (
                  <span style={{ color: '#4D1F84' }}>
                    {editingEvent ? '✨ Update Event' : '✨ Create Event'}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingEvent(null);
                  reset();
                }}
                className="px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Enhanced Events List */}
      <div className="space-y-8 animate-fade-in-up animation-delay-500">
        {events.length > 0 ? (
          <>
            {/* Upcoming Events Section */}
            {upcomingEvents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-white">Upcoming Events ({upcomingEvents.length})</h3>
                </div>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} onEdit={startEditEvent} onToggle={toggleEventStatus} onDelete={deleteEvent} />
                  ))}
                </div>
              </div>
            )}

            {/* Disabled Events Section */}
            {disabledEvents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-white">Disabled Events ({disabledEvents.length})</h3>
                </div>
                <div className="space-y-4">
                  {disabledEvents.map((event) => (
                    <EventCard key={event.id} event={event} onEdit={startEditEvent} onToggle={toggleEventStatus} onDelete={deleteEvent} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events Section */}
            {allPastEvents.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-white">Past Events ({allPastEvents.length})</h3>
                    <button
                      onClick={() => setIsPastEventsVisible(!isPastEventsVisible)}
                      className="flex items-center justify-center w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
                      title={isPastEventsVisible ? 'Hide past events' : 'Show past events'}
                    >
                      {isPastEventsVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Always reserve space for the Show All/Show Less button to prevent layout shift */}
                  <div className="flex items-center">
                    <div className="w-24 h-10"></div>
                  </div>
                </div>
                {isPastEventsVisible && (
                  <>
                    <div className="space-y-4">
                      {pastEvents.map((event) => (
                        <EventCard key={event.id} event={event} onEdit={startEditEvent} onToggle={toggleEventStatus} onDelete={deleteEvent} />
                      ))}
                    </div>
                    {!isPastEventsExpanded && allPastEvents.length > 5 && (
                      <div className="text-center py-4">
                        <button
                          onClick={() => setIsPastEventsExpanded(!isPastEventsExpanded)}
                          className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 mx-auto"
                          title="Show all past events"
                        >
                          <span>Show All ({allPastEvents.length - 5} more)</span>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <p className="text-white/60 text-sm mt-2">
                          Showing {pastEvents.length} of {allPastEvents.length} past events
                        </p>
                      </div>
                    )}
                    {isPastEventsExpanded && allPastEvents.length > 5 && (
                      <div className="text-center py-4">
                        <button
                          onClick={() => setIsPastEventsExpanded(!isPastEventsExpanded)}
                          className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 mx-auto"
                          title="Show fewer past events"
                        >
                          <span>Show Less</span>
                          <ChevronUp className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <Calendar className="h-20 w-20 text-white/30 mx-auto" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-nova-cyan/20 rounded-full flex items-center justify-center">
                <span className="text-nova-cyan">✦</span>
              </div>
            </div>
            <p className="text-white/60 text-xl font-medium mb-2">No events created yet</p>
            <p className="text-white/40">Create your first volleyball event to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
