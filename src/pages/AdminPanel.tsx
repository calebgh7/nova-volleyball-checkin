import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Users, Edit3, Trash2, Shield, Eye, EyeOff, BarChart3, Calendar, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import type { CheckInStats, CheckIn } from '../types';

interface StaffUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'staff']),
});

type UserForm = z.infer<typeof userSchema>;

export default function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff'>('dashboard');
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  
  // Dashboard states
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  // Utility function for formatting date/time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    fetchUsers();
    fetchDashboardData();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await api.get('/auth/users');
      console.log('Users response:', response.data);
      setUsers((response.data as any).users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to load staff accounts' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, checkinsResponse] = await Promise.all([
        api.get('/checkins/stats'),
        api.get('/checkins/today')
      ]);
      setStats(statsResponse.data.stats);
      setRecentCheckIns(checkinsResponse.data.checkins);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const onSubmitUser = async (data: UserForm) => {
    try {
      console.log('Submitting user data:', data);
      
      if (editingUser) {
        // Update existing user
        const updateData: any = { ...data };
        // Only include password if it's provided
        if (!data.password || !data.password.trim()) {
          const { password, ...dataWithoutPassword } = updateData;
          await api.put(`/auth/users/${editingUser.id}`, dataWithoutPassword);
        } else {
          await api.put(`/auth/users/${editingUser.id}`, updateData);
        }
        setMessage({ type: 'success', text: 'Staff account updated successfully!' });
      } else {
        // Create new user
        await api.post('/auth/register', data);
        setMessage({ type: 'success', text: 'Staff account created successfully!' });
      }
      
      setShowCreateForm(false);
      setEditingUser(null);
      reset();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating/updating user:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || `Failed to ${editingUser ? 'update' : 'create'} staff account`
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this staff account?')) {
      try {
        await api.delete(`/auth/users/${userId}`);
        setMessage({ type: 'success', text: 'Staff account deleted successfully' });
        fetchUsers();
      } catch (error: any) {
        setMessage({
          type: 'error',
          text: error.response?.data?.error || 'Failed to delete staff account'
        });
      }
    }
  };

  const handleEditUser = (user: StaffUser) => {
    setEditingUser(user);
    setShowCreateForm(true);
    // Pre-fill the form with user data
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      password: '' // Don't pre-fill password for security
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setShowCreateForm(false);
    reset();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nova-purple">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-nova-cyan/30"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-nova-cyan absolute top-0 left-0"></div>
          </div>
          <p className="text-white font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Alert Messages */}
      {message && (
        <div className={`p-6 rounded-2xl glass border animate-bounce-in ${
          message.type === 'success' 
            ? 'border-green-400/30 bg-green-50/20' 
            : 'border-red-400/30 bg-red-50/20'
        }`}>
          <p className={`font-medium ${
            message.type === 'success' ? 'text-green-300' : 'text-red-300'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-2xl p-1 animate-fade-in-up">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
            activeTab === 'dashboard'
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
            activeTab === 'staff'
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="h-5 w-5" />
          <span>Staff Management</span>
        </button>
      </div>

      {/* Dashboard Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => navigate('/checkin')}
                className="bg-gradient-to-br from-cyan-500/15 to-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-cyan-400/30 hover:scale-105 transition-all duration-300 group shadow-lg shadow-cyan-500/10 text-left cursor-pointer hover:border-cyan-400/50"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-nova-cyan/20 to-nova-cyan/10 rounded-xl backdrop-blur-sm border border-nova-cyan/30 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-6 w-6 text-nova-cyan" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-white/70">Today's Check-ins</p>
                    <p className="text-3xl font-bold text-white">{stats.today}</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/admin')}
                className="bg-gradient-to-br from-green-500/15 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 hover:scale-105 transition-all duration-300 group shadow-lg shadow-green-500/10 text-left cursor-pointer hover:border-green-400/50"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-xl backdrop-blur-sm border border-green-400/30 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-white/70">This Week</p>
                    <p className="text-3xl font-bold text-white">{stats.thisWeek}</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/admin')}
                className="bg-gradient-to-br from-purple-500/15 to-violet-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30 hover:scale-105 transition-all duration-300 group shadow-lg shadow-purple-500/10 text-left cursor-pointer hover:border-purple-400/50"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-nova-purple/20 to-nova-purple/10 rounded-xl backdrop-blur-sm border border-nova-purple/30 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-nova-purple" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-white/70">Total Check-ins</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/athletes')}
                className="bg-gradient-to-br from-red-500/15 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-red-400/30 hover:scale-105 transition-all duration-300 group shadow-lg shadow-red-500/10 text-left cursor-pointer hover:border-red-400/50"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-400/10 rounded-xl backdrop-blur-sm border border-red-400/30 group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-white/70">Waiver Issues</p>
                    <p className="text-3xl font-bold text-white">{stats.waiverNotValidated}</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Recent Check-ins */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 backdrop-blur-sm rounded-3xl border border-nova-cyan/20 shadow-xl shadow-nova-purple/5">
            <div className="p-8 border-b border-nova-cyan/20">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-nova-cyan to-nova-purple rounded-full mr-3"></div>
                Recent Check-ins
              </h3>
            </div>
            <div className="p-8">
              {recentCheckIns.length > 0 ? (
                <div className="space-y-4">
                  {recentCheckIns.slice(0, 5).map((checkin) => (
                    <div key={checkin.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-nova-cyan/30 to-nova-purple/30 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{checkin.firstName} {checkin.lastName}</p>
                          <p className="text-sm text-white/60">{checkin.eventName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white/80">{formatDateTime(checkin.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No check-ins today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Staff Management Tab Content */}
      {activeTab === 'staff' && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-8 bg-gradient-to-b from-nova-cyan to-nova-purple rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Staff Accounts ({users.length})</h2>
            </div>
            <button
              onClick={() => {
                setEditingUser(null);
                setShowCreateForm(!showCreateForm);
                reset();
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
              <UserPlus className="h-5 w-5" style={{ color: '#4D1F84' }} />
              <span style={{ color: '#4D1F84' }}>{showCreateForm ? 'Cancel' : 'Add Staff'}</span>
            </button>
          </div>

          {/* Create Staff Form */}
          {showCreateForm && (
            <div className="bg-gradient-to-br from-nova-purple/15 to-nova-purple/5 backdrop-blur-sm rounded-3xl p-8 border border-nova-cyan/30 animate-fade-in-up shadow-lg shadow-nova-purple/10">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-nova-cyan to-nova-purple rounded-full mr-3"></div>
                {editingUser ? 'Edit Staff Account' : 'Create New Staff Account'}
              </h3>
              <form onSubmit={handleSubmit(onSubmitUser)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    First Name *
                  </label>
                  <input
                    {...register('firstName')}
                    className="input-modern w-full"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-300 text-sm mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Last Name *
                  </label>
                  <input
                    {...register('lastName')}
                    className="input-modern w-full"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-300 text-sm mt-1">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Username *
                  </label>
                  <input
                    {...register('username')}
                    className="input-modern w-full"
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <p className="text-red-300 text-sm mt-1">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input-modern w-full"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Password {editingUser ? '(leave blank to keep current)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      {...register('password', editingUser ? {} : undefined)}
                      type={showPassword ? 'text' : 'password'}
                      className="input-modern w-full pr-12"
                      placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-300 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Role *
                  </label>
                  <select
                    {...register('role')}
                    className="select-modern w-full"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-300 text-sm mt-1">{errors.role.message}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
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
                      <span style={{ color: '#4D1F84' }}>{editingUser ? 'Updating...' : 'Creating...'}</span>
                    </div>
                  ) : (
                    <span style={{ color: '#4D1F84' }}>
                      ✨ {editingUser ? 'Update Staff Account' : 'Create Staff Account'}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff Accounts Table */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 backdrop-blur-sm rounded-3xl border border-nova-cyan/20 animate-fade-in-up animation-delay-200 shadow-xl shadow-nova-purple/5">
        <div className="p-8 border-b border-nova-cyan/20">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-nova-cyan to-nova-purple rounded-full mr-3"></div>
            Current Staff Accounts
          </h3>
        </div>
          <div className="overflow-x-auto">
            {users.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-white/70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                      <td className="px-8 py-6">
                        <div>
                          <div className="text-lg font-semibold text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-white/60">
                            @{user.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-white">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-nova-purple/20 text-nova-cyan border border-nova-purple/30' 
                            : 'bg-nova-cyan/20 text-white border border-nova-cyan/30'
                        }`}>
                          {user.role === 'admin' ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : (
                            <Users className="h-3 w-3 mr-1" />
                          )}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-white/60">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-nova-cyan hover:text-white hover:bg-nova-cyan/10 rounded-lg transition-colors duration-200"
                            title="Edit user"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteUser(user.id)}
                            className="p-2 text-red-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
                <p className="text-white/60 text-lg font-medium">No staff accounts yet</p>
                <p className="text-white/40 text-sm mt-2">Create your first staff account to get started</p>
              </div>
            )}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
