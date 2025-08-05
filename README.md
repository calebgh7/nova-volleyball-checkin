# 🏐 Nova Volleyball Club Check-In System

A comprehensive full-stack web application for managing volleyball club check-ins, athlete profiles, and event management.

## 🌟 Features

### ✅ **Athlete Management**
- Quick check-in for returning athletes
- New athlete registration with profile creation
- Real-time waiver status validation
- Last visited tracking
- Comprehensive athlete database

### 📅 **Event Management**
- Create and manage volleyball events
- Capacity tracking and management
- Event scheduling with time management
- Active/inactive event status

### 👥 **Staff Administration**
- Secure staff login system
- Admin dashboard with key metrics
- User role management (Admin/Staff)
- Complete CRM integration capabilities

### 📊 **Analytics & Reporting**
- Real-time check-in analytics
- Today's check-ins display
- Athlete visit tracking
- Data export capabilities

## 🚀 Tech Stack

### **Frontend**
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Axios** for API communication
- **Lucide React** for icons

### **Backend**
- **Node.js** with Express
- **TypeScript** throughout
- **SQLite** database
- **JWT** authentication
- **bcryptjs** for password security
- **Helmet** for security headers

### **Development**
- **Vite** for build tooling
- **ESLint** for code quality
- **Concurrently** for dev environment

## 📱 User Interface

The application features a modern, responsive design with the Nova brand colors:
- **Primary Purple**: #9682EB
- **Dark Purple**: #4D1F84  
- **Cyan Blue**: #B9E7FE
- **Accent Purple**: #5A1FB7
- **Black**: #000000

## 🗄️ Database Schema

### **Athletes**
- Personal information (name, DOB, contact details)
- Emergency contact information
- Waiver status and expiration tracking
- Last visited date tracking
- Join date and profile management

### **Events**
- Event details (name, description, date/time)
- Capacity management
- Active status tracking
- Creator and timestamp tracking

### **Check-ins**
- Athlete-event relationship tracking
- Check-in timestamps
- Waiver validation status
- Notes and additional information

### **Users (Staff/Admin)**
- Secure authentication system
- Role-based access control
- User management capabilities

## 🔐 Security Features

- **JWT-based authentication**
- **Password hashing** with bcryptjs
- **Protected API routes**
- **CORS configuration**
- **Input validation** with Zod schemas
- **SQL injection protection**
- **XSS protection** with Helmet

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Check-In-Full-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize Database**
   ```bash
   npm run setup
   ```

5. **Start Development Servers**
   ```bash
   npm start
   ```

This will start both the frontend (http://localhost:5173) and backend (http://localhost:3001) servers.

### Default Admin Credentials
- **Username**: `calebhobbs`
- **Email**: `caleb@aznova.org`
- **Password**: `@zCardinals16`

## 🌐 Deployment

### GitHub Pages (Frontend Only)
The frontend can be deployed to GitHub Pages for demonstration purposes.

### Full Stack Deployment
For production use with backend functionality, consider:
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Backend**: Railway, Render, or DigitalOcean
- **Database**: PostgreSQL, MySQL, or managed SQLite

## 🎯 Usage

### **Quick Check-In Flow**
1. Navigate to `/checkin`
2. Search for existing athlete or create new profile
3. Select event for check-in
4. Validate waiver status
5. Complete check-in process

### **Admin Dashboard**
1. Login at `/login`
2. Access dashboard for overview metrics
3. Manage athletes, events, and users
4. Export data for CRM integration

### **Event Management**
1. Create events with capacity limits
2. Set active/inactive status
3. Monitor real-time capacity
4. Track check-in analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏐 About Nova Volleyball Club

This system was designed specifically for volleyball clubs and sports organizations needing efficient athlete management and check-in capabilities.

---

**Built with ❤️ for the volleyball community**
