// Demo data for GitHub Pages deployment
export const demoAthletes = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1995-06-15',
    emergencyContact: 'Jane Smith',
    emergencyContactEmail: 'jane.smith@email.com',
    emergencyPhone: '(555) 987-6543',
    hasValidWaiver: true,
    waiverSignedDate: '2024-08-01',
    waiverExpirationDate: '2025-08-01',
    lastVisited: '2024-08-03',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-08-03T15:30:00Z'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 234-5678',
    dateOfBirth: '1998-03-22',
    emergencyContact: 'Mike Johnson',
    emergencyContactEmail: 'mike.j@email.com',
    emergencyPhone: '(555) 876-5432',
    hasValidWaiver: false,
    waiverSignedDate: null,
    waiverExpirationDate: null,
    lastVisited: null,
    createdAt: '2024-07-15T14:20:00Z',
    updatedAt: '2024-07-15T14:20:00Z'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Davis',
    email: 'mike.davis@email.com',
    phone: '(555) 345-6789',
    dateOfBirth: '1992-11-08',
    emergencyContact: 'Lisa Davis',
    emergencyContactEmail: 'lisa.davis@email.com',
    emergencyPhone: '(555) 765-4321',
    hasValidWaiver: true,
    waiverSignedDate: '2024-07-20',
    waiverExpirationDate: '2025-07-20',
    lastVisited: '2024-08-02',
    createdAt: '2024-07-20T09:15:00Z',
    updatedAt: '2024-08-02T18:45:00Z'
  }
];

export const demoEvents = [
  {
    id: '1',
    name: 'Open Gym Session',
    description: 'Drop-in volleyball practice and scrimmage',
    date: '2024-08-04',
    startTime: '18:00',
    endTime: '21:00',
    maxCapacity: 24,
    currentCapacity: 8,
    isActive: true,
    createdBy: 'admin',
    createdAt: '2024-08-01T08:00:00Z',
    updatedAt: '2024-08-04T10:30:00Z'
  },
  {
    id: '2',
    name: 'Advanced Training',
    description: 'Skills development for experienced players',
    date: '2024-08-05',
    startTime: '19:00',
    endTime: '21:30',
    maxCapacity: 16,
    currentCapacity: 4,
    isActive: true,
    createdBy: 'admin',
    createdAt: '2024-08-01T08:15:00Z',
    updatedAt: '2024-08-04T16:20:00Z'
  }
];

export const demoCheckIns = [
  {
    id: '1',
    athleteId: '1',
    eventId: '1',
    checkInTime: '2024-08-04T18:15:00Z',
    waiverValidated: true,
    notes: '',
    createdAt: '2024-08-04T18:15:00Z',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    eventName: 'Open Gym Session',
    eventDate: '2024-08-04'
  },
  {
    id: '2',
    athleteId: '3',
    eventId: '1',
    checkInTime: '2024-08-04T18:30:00Z',
    waiverValidated: true,
    notes: '',
    createdAt: '2024-08-04T18:30:00Z',
    firstName: 'Mike',
    lastName: 'Davis',
    email: 'mike.davis@email.com',
    eventName: 'Open Gym Session',
    eventDate: '2024-08-04'
  }
];

export const demoUser = {
  id: 'demo-user',
  username: 'demo',
  email: 'demo@nova.com',
  role: 'admin',
  firstName: 'Demo',
  lastName: 'User'
};
