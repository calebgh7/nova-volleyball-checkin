import { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import type { CheckInStats, CheckIn } from '../types';
import { formatDateTime } from '../lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchRecentCheckIns(),
    ]).finally(() => setLoading(false));
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/checkins/stats');
      setStats((response.data as any).stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-nova-purple/30"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-nova-purple absolute top-0 left-0"></div>
          </div>
          <p className="text-white font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
          <div className="glass rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-nova-cyan/20 to-nova-cyan/10 rounded-xl backdrop-blur-sm border border-nova-cyan/30 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-nova-cyan" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-white/70">Today's Check-ins</p>
                <p className="text-3xl font-bold text-white">{stats.today}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-xl backdrop-blur-sm border border-green-400/30 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-white/70">This Week</p>
                <p className="text-3xl font-bold text-white">{stats.thisWeek}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-nova-purple/20 to-nova-purple/10 rounded-xl backdrop-blur-sm border border-nova-purple/30 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-nova-purple" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-white/70">Total Check-ins</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/20 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-400/10 rounded-xl backdrop-blur-sm border border-red-400/30 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-white/70">Waiver Issues</p>
                <p className="text-3xl font-bold text-white">{stats.waiverNotValidated}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Waiver Status Summary */}
      {stats && (
        <div className="glass rounded-3xl p-8 border border-white/20 animate-fade-in-up animation-delay-400">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-nova-cyan to-nova-purple rounded-full mr-3"></div>
            Waiver Status Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center p-6 bg-gradient-to-r from-green-500/20 to-green-400/10 rounded-2xl backdrop-blur-sm border border-green-400/30 hover:scale-105 transition-all duration-300">
              <div className="p-3 bg-green-400/20 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="font-semibold text-green-300">Valid Waivers</p>
                <p className="text-3xl font-bold text-white">{stats.waiverValidated}</p>
              </div>
            </div>
            <div className="flex items-center p-6 bg-gradient-to-r from-red-500/20 to-red-400/10 rounded-2xl backdrop-blur-sm border border-red-400/30 hover:scale-105 transition-all duration-300">
              <div className="p-3 bg-red-400/20 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="font-semibold text-red-300">Waiver Issues</p>
                <p className="text-3xl font-bold text-white">{stats.waiverNotValidated}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Recent Check-ins */}
      <div className="glass rounded-3xl border border-white/20 animate-fade-in-up animation-delay-500">
        <div className="p-8 border-b border-white/10">
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
