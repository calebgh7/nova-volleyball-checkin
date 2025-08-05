export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyContactEmail?: string;
  emergencyPhone: string;
  hasValidWaiver: boolean;
  waiverSignedDate?: string;
  waiverExpirationDate?: string;
  lastVisited?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentCapacity: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  athleteId: string;
  eventId: string;
  checkInTime: string;
  waiverValidated: boolean;
  notes?: string;
  createdAt: string;
  // Joined fields
  firstName?: string;
  lastName?: string;
  email?: string;
  eventName?: string;
  eventDate?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface EventStats {
  totalCheckins: number;
  waiverValidated: number;
  waiverNotValidated: number;
  capacityUsed: string;
}

export interface CheckInStats {
  today: number;
  thisWeek: number;
  total: number;
  waiverValidated: number;
  waiverNotValidated: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface AthletesResponse {
  athletes: Athlete[];
}

export interface EventsResponse {
  events: Event[];
}

export interface CheckInsResponse {
  checkins: CheckIn[];
}

export interface StatsResponse {
  stats: CheckInStats;
}

export interface UsersResponse {
  users: User[];
}

export interface AthleteResponse {
  athlete: Athlete;
}

export interface LoginResponse {
  token: string;
  user: User;
}
