# Volleyball Club Check-In System

A comprehensive web application for managing volleyball club check-ins, athlete profiles, and events.

## Features

- **Quick Check-In**: Fast athlete check-in with waiver validation
- **Athlete Management**: Store and manage athlete profiles and contact information
- **Event Management**: Create and manage volleyball events and open gyms
- **Waiver Validation**: Automatic waiver status checking during check-in
- **Staff Dashboard**: Real-time analytics and check-in monitoring
- **CRM Integration**: Export data for external CRM systems

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js with Express, TypeScript
- **Database**: SQLite (easily upgradeable to PostgreSQL/MySQL)
- **Authentication**: JWT tokens
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd check-in-full-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm start
```

This will start both the frontend (http://localhost:5173) and backend (http://localhost:3001) concurrently.

### Default Admin Account

For first-time setup, you'll need to create an admin account by making a POST request to `/api/auth/register`:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@yourclub.com",
    "password": "admin123",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

## Project Structure

```
├── src/                    # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API client
│   └── types/             # TypeScript type definitions
├── server/                # Backend Express server
│   ├── routes/            # API route handlers
│   ├── database.ts        # Database setup and models
│   └── index.ts           # Server entry point
└── public/                # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create new user (admin only)
- `GET /api/auth/me` - Get current user info

### Athletes
- `GET /api/athletes` - Get all athletes
- `GET /api/athletes/search` - Search athletes
- `POST /api/athletes` - Create new athlete
- `PUT /api/athletes/:id` - Update athlete
- `PATCH /api/athletes/:id/waiver` - Update waiver status

### Events
- `GET /api/events` - Get all events
- `GET /api/events/today` - Get today's events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `PATCH /api/events/:id/toggle` - Toggle event status

### Check-ins
- `GET /api/checkins` - Get all check-ins
- `POST /api/checkins` - Create new check-in
- `GET /api/checkins/today` - Get today's check-ins
- `GET /api/checkins/export` - Export check-in data

## Usage

### For Athletes (Public Check-In)

1. Visit the check-in page (no login required)
2. Search for your profile or create a new one
3. Select the event you're attending
4. Complete the check-in

### For Staff

1. Login with your staff credentials
2. Access the dashboard for overview and analytics
3. Manage athlete profiles and waiver status
4. Create and manage events
5. Export data for CRM integration

## Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
npm run preview
```

### Environment Variables

- `VITE_API_URL` - Backend API URL for frontend
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3001)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
