import { useState, useEffect } from 'react';
import { Search, Edit, Shield, Mail, Phone, X, Save, UserPlus } from 'lucide-react';
import { api } from '../lib/api';
import type { Athlete } from '../types';
import { formatDate, getWaiverStatus } from '../lib/utils';

export default function AthleteManagementPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [editForm, setEditForm] = useState<Partial<Athlete>>({});
  const [showNewAthleteForm, setShowNewAthleteForm] = useState(false);
  const [newAthleteForm, setNewAthleteForm] = useState<Partial<Athlete>>({});

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const response = await api.get('/athletes');
      setAthletes((response.data as any).athletes);
    } catch (error) {
      console.error('Error fetching athletes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAthletes = athletes.filter(
    (athlete) =>
      athlete.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (athlete.email && athlete.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const updateWaiverStatus = async (athleteId: string, hasValidWaiver: boolean, expirationDate?: string) => {
    try {
      const waiverSignedDate = hasValidWaiver ? new Date().toISOString().split('T')[0] : undefined;
      
      await api.patch(`/athletes/${athleteId}/waiver`, {
        hasValidWaiver,
        waiverSignedDate,
        waiverExpirationDate: expirationDate,
      });
      fetchAthletes(); // Refresh the list
    } catch (error) {
      console.error('Error updating waiver status:', error);
    }
  };

  const startEditingAthlete = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setEditForm({
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      email: athlete.email,
      phone: athlete.phone,
      dateOfBirth: athlete.dateOfBirth,
      emergencyContact: athlete.emergencyContact,
      emergencyContactEmail: athlete.emergencyContactEmail,
      emergencyPhone: athlete.emergencyPhone,
    });
  };

  const cancelEditing = () => {
    setEditingAthlete(null);
    setEditForm({});
  };

  const updateAthlete = async () => {
    if (!editingAthlete) return;
    
    try {
      await api.put(`/athletes/${editingAthlete.id}`, editForm);
      fetchAthletes(); // Refresh the list
      cancelEditing();
    } catch (error) {
      console.error('Error updating athlete:', error);
    }
  };

  const startAddingAthlete = () => {
    setShowNewAthleteForm(true);
    setNewAthleteForm({});
  };

  const cancelAddingAthlete = () => {
    setShowNewAthleteForm(false);
    setNewAthleteForm({});
  };

  const createNewAthlete = async () => {
    try {
      await api.post('/athletes', newAthleteForm);
      fetchAthletes(); // Refresh the list
      cancelAddingAthlete();
    } catch (error) {
      console.error('Error creating athlete:', error);
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
          <p className="text-white font-medium">Loading athletes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Action Bar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 animate-fade-in-up">
        {/* Enhanced Search */}
        <div className="bg-gradient-to-br from-nova-purple/20 to-nova-purple/10 backdrop-blur-sm rounded-2xl p-6 border border-nova-cyan/30 flex-1 max-w-md shadow-lg shadow-nova-purple/10">
          <div className="search-input relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athletes..."
              className="input-modern w-full"
            />
            <Search className="search-icon h-5 w-5" />
          </div>
        </div>

        {/* Enhanced Add Button */}
        <button 
          onClick={startAddingAthlete}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-nova-cyan to-nova-cyan/80 text-nova-purple font-bold rounded-xl hover:shadow-xl hover:shadow-nova-cyan/25 transition-all duration-200 border-2 border-nova-cyan/20"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          <span>Add Athlete</span>
        </button>
      </div>

      {/* Enhanced Athletes Table */}
      <div className="bg-gradient-to-br from-nova-purple/20 to-nova-purple/10 backdrop-blur-sm rounded-3xl border border-nova-cyan/30 animate-fade-in-up animation-delay-400 shadow-lg shadow-nova-purple/10">
        <div className="p-8 border-b border-nova-cyan/20">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-nova-cyan to-nova-purple rounded-full mr-3"></div>
            Athletes ({filteredAthletes.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {filteredAthletes.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Athlete
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">
                    DOB
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Waiver
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Emergency
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAthletes.map((athlete) => {
                  const waiverStatus = getWaiverStatus(athlete.hasValidWaiver, athlete.waiverExpirationDate);
                  return (
                    <tr key={athlete.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {athlete.firstName} {athlete.lastName}
                          </div>
                          <div className="text-xs text-white/60">
                            Joined {formatDate(athlete.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-white">
                            <Mail className="h-3 w-3 mr-1 text-nova-cyan" />
                            <span className="truncate max-w-[120px]">{athlete.email || 'No email'}</span>
                          </div>
                          <div className="flex items-center text-xs text-white/60">
                            <Phone className="h-3 w-3 mr-1 text-nova-cyan" />
                            {athlete.phone || 'No phone'}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-xs text-white font-medium text-center">
                        {formatDate(athlete.dateOfBirth)}
                      </td>
                      <td className="px-3 py-4 text-xs text-white font-medium text-center">
                        {athlete.lastVisited ? formatDate(athlete.lastVisited) : (
                          <span className="text-white/40">Never</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <div className="flex justify-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border ${waiverStatus.status === 'valid' ? 'bg-green-400/20 text-green-300 border-green-400/30' : 
                           waiverStatus.status === 'expired' ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30' : 'bg-red-400/20 text-red-300 border-red-400/30'}`}>
                            {waiverStatus.status === 'valid' ? '✓' : 
                             waiverStatus.status === 'expired' ? '⚠' : '✗'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <div className="space-y-1">
                          {athlete.waiverSignedDate && (
                            <div className="text-xs text-white">
                              {formatDate(athlete.waiverSignedDate)}
                            </div>
                          )}
                          {athlete.waiverExpirationDate && (
                            <div className="text-xs text-white/60">
                              Exp: {formatDate(athlete.waiverExpirationDate)}
                            </div>
                          )}
                          {!athlete.waiverSignedDate && !athlete.waiverExpirationDate && (
                            <div className="text-xs text-white/40">None</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-1">
                          <div className="text-xs text-white font-medium truncate max-w-[100px]">{athlete.emergencyContact}</div>
                          <div className="text-xs text-white/60 truncate max-w-[100px]">{athlete.emergencyContactEmail || 'No email'}</div>
                          <div className="text-xs text-white/60">{athlete.emergencyPhone}</div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                          onClick={() => startEditingAthlete(athlete)}
                          className="btn-glass p-1.5"
                          title="Edit athlete information"
                        >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              const newStatus = !athlete.hasValidWaiver;
                              const expirationDate = newStatus ? 
                                new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
                                undefined;
                              updateWaiverStatus(athlete.id, newStatus, expirationDate);
                            }}
                            className={`btn-glass p-1.5 ${
                              athlete.hasValidWaiver ? 'text-red-400 hover:bg-red-400/30' : 'text-green-400 hover:bg-green-400/30'
                            }`}
                            title={athlete.hasValidWaiver ? 'Mark waiver as invalid/expired' : 'Mark waiver as valid'}
                          >
                            <Shield className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <div className="relative inline-block mb-4">
                <Search className="h-16 w-16 text-white/30 mx-auto" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-nova-cyan/20 rounded-full flex items-center justify-center">
                  <span className="text-nova-cyan text-xs">✦</span>
                </div>
              </div>
              <p className="text-white/60 text-lg font-medium">
                {searchQuery ? 'No athletes found matching your search' : 'No athletes registered yet'}
              </p>
              <p className="text-white/40 text-sm mt-2">Athletes will appear here as they register</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingAthlete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-nova-purple/95 to-nova-dark-purple/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-white/20 shadow-2xl m-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Edit Athlete</h2>
              <button
                onClick={cancelEditing}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-200 border border-white/20"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName || ''}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName || ''}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter last name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-3">Email (Optional)</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="athlete@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Phone (Optional)</label>
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Date of Birth</label>
                <input
                  type="date"
                  value={editForm.dateOfBirth || ''}
                  onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Emergency Contact</label>
                <input
                  type="text"
                  value={editForm.emergencyContact || ''}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="Emergency contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Emergency Contact Email (Optional)</label>
                <input
                  type="email"
                  value={editForm.emergencyContactEmail || ''}
                  onChange={(e) => setEditForm({ ...editForm, emergencyContactEmail: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="emergency@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Emergency Phone</label>
                <input
                  type="tel"
                  value={editForm.emergencyPhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="(555) 987-6543"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t-2 border-white/20">
              <button
                onClick={cancelEditing}
                className="flex-1 px-6 py-4 text-white/80 hover:text-white transition-all duration-200 rounded-xl border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={updateAthlete}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-nova-cyan to-nova-cyan/80 text-nova-purple font-bold rounded-xl hover:shadow-xl hover:shadow-nova-cyan/25 transition-all duration-200 flex items-center justify-center gap-3 border-2 border-nova-cyan/20"
              >
                <Save className="h-5 w-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Athlete Modal */}
      {showNewAthleteForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-nova-purple/95 to-nova-dark-purple/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-white/20 shadow-2xl m-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Add New Athlete</h2>
              <button
                onClick={cancelAddingAthlete}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-200 border border-white/20"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-3">First Name</label>
                <input
                  type="text"
                  value={newAthleteForm.firstName || ''}
                  onChange={(e) => setNewAthleteForm({ ...newAthleteForm, firstName: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Last Name</label>
                <input
                  type="text"
                  value={newAthleteForm.lastName || ''}
                  onChange={(e) => setNewAthleteForm({ ...newAthleteForm, lastName: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter last name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-3">Email (Optional)</label>
                <input
                  type="email"
                  value={newAthleteForm.email || ''}
                  onChange={(e) => setNewAthleteForm({ ...newAthleteForm, email: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="athlete@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Phone (Optional)</label>
                <input
                  type="tel"
                  value={newAthleteForm.phone || ''}
                  onChange={(e) => setNewAthleteForm({ ...newAthleteForm, phone: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Date of Birth</label>
                <input
                  type="date"
                  value={newAthleteForm.dateOfBirth || ''}
                  onChange={(e) => setNewAthleteForm({ ...newAthleteForm, dateOfBirth: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Emergency Contact</label>
                <input
                  type="text"
                  value={newAthleteForm.emergencyContact || ''}
                  onChange={(e) => setNewAthleteForm({ ...newAthleteForm, emergencyContact: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="Emergency contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Emergency Contact Email (Optional)</label>
                <input
                  type="email"
                  value={newAthleteForm.emergencyContactEmail || ''}
                  onChange={(e) => setNewAthleteForm({ ...newAthleteForm, emergencyContactEmail: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="emergency@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">Emergency Phone</label>
                <input
                  type="tel"
                  value={newAthleteForm.emergencyPhone || ''}
                  onChange={(e) => setNewAthleteForm({ ...newAthleteForm, emergencyPhone: e.target.value })}
                  className="w-full p-4 bg-white/15 rounded-xl border-2 border-white/20 text-white placeholder-white/50 focus:border-nova-cyan focus:ring-2 focus:ring-nova-cyan/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                  placeholder="(555) 987-6543"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t-2 border-white/20">
              <button
                onClick={cancelAddingAthlete}
                className="flex-1 px-6 py-4 text-white/80 hover:text-white transition-all duration-200 rounded-xl border-2 border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createNewAthlete}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-nova-cyan to-nova-cyan/80 text-nova-purple font-bold rounded-xl hover:shadow-xl hover:shadow-nova-cyan/25 transition-all duration-200 flex items-center justify-center gap-3 border-2 border-nova-cyan/20"
              >
                <UserPlus className="h-5 w-5" />
                Create Athlete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
