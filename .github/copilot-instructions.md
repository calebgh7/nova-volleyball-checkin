<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Volleyball Club Check-In System

This is a full-stack web application for managing volleyball club check-ins with the following features:
- Athlete check-in system with profile management
- Waiver validation against database
- Staff event management
- Admin CRM integration

## Tech Stack
- Frontend: React with TypeScript, Tailwind CSS, React Router
- Backend: Node.js with Express, TypeScript
- Database: SQLite for development
- Authentication: JWT tokens
- Forms: React Hook Form with Zod validation

## Architecture
- `/src` - React frontend application
- `/server` - Express backend API
- Database models for athletes, events, waivers, and check-ins
- RESTful API design with proper error handling
- Type-safe TypeScript throughout

## Key Features to Implement
1. Quick check-in for returning athletes
2. New athlete registration with profile creation
3. Real-time waiver status validation
4. Event management interface for staff
5. Data export capabilities for CRM integration
6. Responsive design for tablet/mobile use

Please maintain consistent TypeScript types, proper error handling, and follow React best practices.
