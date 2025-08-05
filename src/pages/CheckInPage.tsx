import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, UserPlus, CheckCircle, AlertTriangle, Calendar, Users } from 'lucide-react';
import { api } from '../lib/api';
import type { Athlete, Event } from '../types';
import { formatDate, formatTime, formatDateTime, getWaiverStatus } from '../lib/utils';

const checkInSchema = z.object({
  athleteId: z.string().min(1, 'Please select an athlete'),
  eventId: z.string().min(1, 'Please select an event'),
  notes: z.string().optional(),
});

type CheckInForm = z.infer<typeof checkInSchema>;

const newAthleteSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  emergencyContact: z.string().min(1, 'Emergency contact is required'),
  emergencyContactEmail: z.string().email('Invalid emergency contact email').optional().or(z.literal('')),
  emergencyPhone: z.string().min(1, 'Emergency phone is required'),
});

type NewAthleteForm = z.infer<typeof newAthleteSchema>;

export default function CheckInPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [disabledEvents, setDisabledEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [showNewAthleteForm, setShowNewAthleteForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckInForm>({
    resolver: zodResolver(checkInSchema),
  });

  const {
    register: registerNewAthlete,
    handleSubmit: handleSubmitNewAthlete,
    reset: resetNewAthlete,
    formState: { errors: newAthleteErrors, isSubmitting: isSubmittingNewAthlete },
  } = useForm<NewAthleteForm>({
    resolver: zodResolver(newAthleteSchema),
  });

  useEffect(() => {
    fetchTodayEvents();
    fetchDisabledEvents();
    fetchPastEvents();
    fetchRecentCheckIns();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchAthletes();
    } else {
      setAthletes([]);
    }
  }, [searchQuery]);

  const fetchTodayEvents = async () => {
    try {
      const response = await api.get('/events/today');
      setEvents((response.data as any).events);
    } catch (error) {
      console.error('Error fetching events:', error);
      setMessage({ type: 'error', text: 'Failed to load today\'s events' });
    }
  };

  const fetchDisabledEvents = async () => {
    try {
      const response = await api.get('/events/disabled');
      setDisabledEvents((response.data as any).events);
    } catch (error) {
      console.error('Error fetching disabled events:', error);
    }
  };

  const fetchPastEvents = async () => {
    try {
      const response = await api.get('/events/past');
      setPastEvents((response.data as any).events);
    } catch (error) {
      console.error('Error fetching past events:', error);
    }
  };

  const fetchRecentCheckIns = async () => {
    try {
      const response = await api.get('/checkins/today');
      setRecentCheckIns((response.data as any).checkins);
    } catch (error) {
      console.error('Error fetching recent check-ins:', error);
    }
  };

  const searchAthletes = async () => {
    try {
      const response = await api.get(`/athletes/search?query=${encodeURIComponent(searchQuery)}`);
      setAthletes((response.data as any).athletes);
    } catch (error) {
      console.error('Error searching athletes:', error);
    }
  };

  const onSubmitCheckIn = async (data: CheckInForm) => {
    try {
      const response = await api.post('/checkins', data);
      const { waiverValidated } = response.data;
      
      setMessage({
        type: waiverValidated ? 'success' : 'error',
        text: waiverValidated 
          ? 'Check-in successful! Waiver validated.' 
          : 'Check-in successful! ⚠️ WAIVER VALIDATION REQUIRED'
      });
      
      reset();
      setSelectedAthlete(null);
      setSearchQuery('');
      fetchRecentCheckIns(); // Refresh recent check-ins
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Check-in failed'
      });
    }
  };

  const onSubmitNewAthlete = async (data: NewAthleteForm) => {
    try {
      const response = await api.post('/athletes', data);
      const newAthlete = (response.data as any).athlete;
      
      setMessage({ type: 'success', text: 'Athlete profile created successfully!' });
      setSelectedAthlete(newAthlete);
      setShowNewAthleteForm(false);
      resetNewAthlete();
      setSearchQuery(`${newAthlete.firstName} ${newAthlete.lastName}`);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to create athlete profile'
      });
    }
  };

  const selectAthlete = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setSearchQuery(`${athlete.firstName} ${athlete.lastName}`);
    setAthletes([]);
  };

  return (
    <div className="space-y-8">
      {/* Alert Messages */}
      {message && (
        <div className={`p-6 rounded-2xl glass border animate-bounce-in ${
          message.type === 'success' 
            ? 'border-green-400/30 bg-green-50/20' 
            : 'border-red-400/30 bg-red-50/20'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="h-6 w-6 mr-3 text-green-400" />
            ) : (
              <AlertTriangle className="h-6 w-6 mr-3 text-red-400" />
            )}
            <span className={`text-lg font-medium ${
              message.type === 'success' ? 'text-green-100' : 'text-red-100'
            }`}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-gradient-to-br from-nova-purple/15 to-nova-purple/5 backdrop-blur-sm rounded-3xl p-8 border border-nova-cyan/30 shadow-2xl card-hover animate-fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Find or Create Athlete Profile</h2>
            <div className="flex space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
          
          {/* Enhanced Search Section */}
          <div className="mb-8">
            <div className="search-input relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="input-modern w-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(16px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '16px 20px 16px 50px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              />
              <Search 
                className="search-icon h-6 w-6" 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}
              />
            </div>
            
            {/* Enhanced Search Results */}
            {athletes.length > 0 && (
              <div className="mt-4 glass rounded-2xl overflow-hidden border border-white/20">
                {athletes.map((athlete) => {
                  const waiverStatus = getWaiverStatus(athlete.hasValidWaiver, athlete.waiverExpirationDate);
                  return (
                    <button
                      key={athlete.id}
                      onClick={() => selectAthlete(athlete)}
                      className="w-full text-left p-6 hover:bg-white/10 transition-all duration-300 border-b border-white/10 last:border-b-0 group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-semibold text-white text-lg group-hover:text-nova-cyan transition-colors">
                            {athlete.firstName} {athlete.lastName}
                          </div>
                          <div className="text-white/70 mt-1">{athlete.email}</div>
                          <div className="text-white/50 text-sm mt-1">DOB: {formatDate(athlete.dateOfBirth)}</div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                            waiverStatus.status === 'valid' 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : waiverStatus.status === 'expired'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {waiverStatus.status === 'valid' ? '✓ Valid Waiver' : 
                             waiverStatus.status === 'expired' ? '⚠ Expired Waiver' : '✗ No Waiver'}
                          </span>
                          <div className="text-white/40 text-xs">Click to select</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enhanced New Athlete Button */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowNewAthleteForm(true)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-nova-cyan to-nova-cyan/80 text-nova-purple font-bold rounded-xl hover:shadow-xl hover:shadow-nova-cyan/25 transition-all duration-200 border-2 border-nova-cyan/20"
            >
              <UserPlus className="h-6 w-6 mr-3" />
              Create New Athlete Profile
            </button>
            <p className="text-white/60 mt-3">Can't find the athlete? Create a new profile</p>
          </div>

          {/* Enhanced New Athlete Form */}
          {showNewAthleteForm && (
            <div className="mb-8 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-sm rounded-3xl p-8 border border-green-400/30 animate-fade-in-up shadow-lg shadow-green-500/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Create New Athlete Profile</h3>
                <button
                  onClick={() => {
                    setShowNewAthleteForm(false);
                    resetNewAthlete();
                  }}
                  className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmitNewAthlete(onSubmitNewAthlete)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      First Name *
                    </label>
                    <input
                      {...registerNewAthlete('firstName')}
                      className="input-modern w-full"
                      placeholder="Enter first name"
                    />
                    {newAthleteErrors.firstName && (
                      <p className="text-red-300 text-sm mt-1">{newAthleteErrors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Last Name *
                    </label>
                    <input
                      {...registerNewAthlete('lastName')}
                      className="input-modern w-full"
                      placeholder="Enter last name"
                    />
                    {newAthleteErrors.lastName && (
                      <p className="text-red-300 text-sm mt-1">{newAthleteErrors.lastName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      {...registerNewAthlete('email')}
                      className="input-modern w-full"
                      placeholder="athlete@email.com"
                    />
                    {newAthleteErrors.email && (
                      <p className="text-red-300 text-sm mt-1">{newAthleteErrors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Phone (Optional)
                    </label>
                    <input
                      {...registerNewAthlete('phone')}
                      className="input-modern w-full"
                      placeholder="(555) 123-4567"
                    />
                    {newAthleteErrors.phone && (
                      <p className="text-red-300 text-sm mt-1">{newAthleteErrors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      {...registerNewAthlete('dateOfBirth')}
                      className="input-modern w-full"
                    />
                    {newAthleteErrors.dateOfBirth && (
                      <p className="text-red-300 text-sm mt-1">{newAthleteErrors.dateOfBirth.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Emergency Contact *
                    </label>
                    <input
                      {...registerNewAthlete('emergencyContact')}
                      className="input-modern w-full"
                      placeholder="Emergency contact name"
                    />
                    {newAthleteErrors.emergencyContact && (
                      <p className="text-red-300 text-sm mt-1">{newAthleteErrors.emergencyContact.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Emergency Contact Email (Optional)
                    </label>
                    <input
                      type="email"
                      {...registerNewAthlete('emergencyContactEmail')}
                      className="input-modern w-full"
                      placeholder="emergency@email.com"
                    />
                    {newAthleteErrors.emergencyContactEmail && (
                      <p className="text-red-300 text-sm mt-1">{newAthleteErrors.emergencyContactEmail.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Emergency Phone *
                    </label>
                    <input
                      {...registerNewAthlete('emergencyPhone')}
                      className="input-modern w-full"
                      placeholder="(555) 987-6543"
                    />
                    {newAthleteErrors.emergencyPhone && (
                      <p className="text-red-300 text-sm mt-1">{newAthleteErrors.emergencyPhone.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmittingNewAthlete}
                    className="flex-1 bg-nova-cyan text-nova-purple font-semibold py-3 px-6 rounded-xl hover:bg-nova-cyan/80 focus:outline-none focus:ring-4 focus:ring-nova-cyan/30 transition-all duration-200 disabled:opacity-50"
                  >
                    {isSubmittingNewAthlete ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-nova-purple mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      '✨ Create Profile'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAthleteForm(false);
                      resetNewAthlete();
                    }}
                    className="bg-white/20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Enhanced Check-in Form */}
          {selectedAthlete && events.length > 0 && (
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-sm rounded-3xl p-8 border border-blue-400/30 animate-fade-in-up shadow-lg shadow-blue-500/5">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <CheckCircle className="h-7 w-7 mr-3 text-green-400" />
                Complete Check-In
              </h3>
              
              {/* Enhanced Selected Athlete Info */}
              <div className="mb-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-white mb-2">
                      {selectedAthlete.firstName} {selectedAthlete.lastName}
                    </div>
                    <div className="text-white/80 mb-1">{selectedAthlete.email}</div>
                    <div className="text-white/60 text-sm">DOB: {formatDate(selectedAthlete.dateOfBirth)}</div>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const waiverStatus = getWaiverStatus(selectedAthlete.hasValidWaiver, selectedAthlete.waiverExpirationDate);
                      return (
                        <div className="space-y-2">
                          <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full ${
                            waiverStatus.status === 'valid' 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : waiverStatus.status === 'expired'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {waiverStatus.status === 'valid' ? '✓ Valid Waiver' : 
                             waiverStatus.status === 'expired' ? '⚠ Expired Waiver' : '✗ No Waiver'}
                          </span>
                          {selectedAthlete.waiverExpirationDate && (
                            <div className="text-white/60 text-xs">
                              Expires: {formatDate(selectedAthlete.waiverExpirationDate)}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmitCheckIn)} className="space-y-6">
                <input type="hidden" {...register('athleteId')} value={selectedAthlete.id} />
                
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Select Event *
                  </label>
                  <p className="text-white/60 text-xs mb-3">
                    ✅ Active events allow check-ins • 🚫 Disabled events are for reference • 📜 Past events are view-only
                  </p>
                  <div className="select-modern relative">
                    <select
                      {...register('eventId')}
                      className="w-full"
                    >
                      <option value="" className="bg-gray-800 text-white">Choose an event...</option>
                      
                      {/* Active Events */}
                      {events.length > 0 && (
                        <optgroup label="📅 Today's Active Events" className="bg-gray-800 text-green-300">
                          {events.map((event) => (
                            <option key={event.id} value={event.id} className="bg-gray-800 text-white">
                              {event.name} - {formatDate(event.date)} {formatTime(event.startTime)} 
                              ({event.currentCapacity}/{event.maxCapacity} spots)
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {/* Disabled Events */}
                      {disabledEvents.length > 0 && (
                        <optgroup label="🚫 Disabled Events (Check-ins not allowed)" className="bg-gray-800 text-yellow-300">
                          {disabledEvents.map((event) => (
                            <option key={event.id} value={event.id} disabled className="bg-gray-700 text-gray-400">
                              {event.name} - {formatDate(event.date)} {formatTime(event.startTime)} 
                              ({event.currentCapacity}/{event.maxCapacity} spots) - DISABLED
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {/* Past Events */}
                      {pastEvents.length > 0 && (
                        <optgroup label="📜 Past Events (Reference only)" className="bg-gray-800 text-gray-400">
                          {pastEvents.slice(0, 10).map((event) => (
                            <option key={event.id} value={event.id} disabled className="bg-gray-700 text-gray-500">
                              {event.name} - {formatDate(event.date)} {formatTime(event.startTime)} 
                              ({event.currentCapacity}/{event.maxCapacity} spots) - PAST
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <Calendar className="select-icon h-5 w-5" />
                  </div>
                  {errors.eventId && (
                    <p className="text-red-300 text-sm mt-2">{errors.eventId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Notes (optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="input-modern w-full resize-none"
                    placeholder="Any additional notes or special requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center"
                  style={{
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
                    opacity: isSubmitting ? '0.7' : '1',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
                      Checking In...
                    </div>
                  ) : (
                    '🏐 Complete Check-In'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Enhanced No Events Warning */}
          {events.length === 0 && disabledEvents.length === 0 && pastEvents.length === 0 && (
            <div className="text-center py-12 glass rounded-3xl border border-white/20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
                <Calendar className="h-10 w-10 text-white/60" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Events Found</h3>
              <p className="text-white/70">No volleyball events are available at this time.</p>
              <p className="text-white/50 text-sm mt-2">Please contact staff to add events or check back later.</p>
            </div>
          )}

          {/* Events Summary when athlete selected but no active events */}
          {selectedAthlete && events.length === 0 && (disabledEvents.length > 0 || pastEvents.length > 0) && (
            <div className="glass rounded-3xl p-8 border border-white/20 animate-fade-in-up">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Calendar className="h-7 w-7 mr-3 text-yellow-400" />
                No Active Events Available
              </h3>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  <h4 className="text-lg font-semibold text-white">Event Status Summary</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-400">{events.length}</div>
                    <div className="text-sm text-white/70">Active Events Today</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-yellow-400">{disabledEvents.length}</div>
                    <div className="text-sm text-white/70">Disabled Events</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-gray-400">{pastEvents.length}</div>
                    <div className="text-sm text-white/70">Past Events</div>
                  </div>
                </div>
              </div>
              
              <p className="text-white/80 text-center">
                {disabledEvents.length > 0 
                  ? `There are ${disabledEvents.length} disabled events that are not accepting check-ins.`
                  : 'No events are currently available for check-in.'
                }
              </p>
              <p className="text-white/60 text-sm text-center mt-2">
                Please contact staff to activate events or create new ones.
              </p>
            </div>
          )}
        </div>

        {/* Recent Check-ins Section */}
        <div className="bg-gradient-to-br from-nova-purple/15 to-nova-purple/5 backdrop-blur-sm rounded-3xl border border-nova-cyan/30 shadow-2xl animate-fade-in-up animation-delay-400">
          <div className="p-8 border-b border-nova-cyan/20">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-nova-cyan to-nova-purple rounded-full mr-3"></div>
              Today's Check-ins
            </h2>
          </div>
          <div className="overflow-x-auto">
            {recentCheckIns.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                      Athlete
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                      Check-in Time
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                      Waiver Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentCheckIns.map((checkin) => (
                    <tr key={checkin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                      <td className="px-8 py-6">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {checkin.firstName} {checkin.lastName}
                          </div>
                          <div className="text-sm text-white/60">{checkin.email}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-white font-medium">
                        {checkin.eventName}
                      </td>
                      <td className="px-8 py-6 text-sm text-white/80">
                        {formatDateTime(checkin.checkInTime)}
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border ${
                            checkin.waiverValidated
                              ? 'bg-green-400/20 text-green-300 border-green-400/30'
                              : 'bg-red-400/20 text-red-300 border-red-400/30'
                          }`}
                        >
                          {checkin.waiverValidated ? '✓ Valid' : '⚠ Invalid'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16">
                <div className="relative inline-block mb-4">
                  <Users className="h-16 w-16 text-white/30 mx-auto" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-nova-cyan/20 rounded-full flex items-center justify-center">
                    <span className="text-nova-cyan text-xs">✦</span>
                  </div>
                </div>
                <p className="text-white/60 text-lg font-medium">No check-ins today yet</p>
                <p className="text-white/40 text-sm mt-2">Athletes will appear here as they check in</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
