#!/bin/bash

# Setup script for Volleyball Check-In System
echo "🏐 Setting up Volleyball Check-In System"
echo "========================================"

# Check if server is running
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "❌ Server is not running. Please start it first with: npm start"
    exit 1
fi

echo "✅ Server is running"

# Create admin user
echo "📝 Creating admin user..."

RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@volleyballclub.com",
    "password": "admin123",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  }')

if echo "$RESPONSE" | grep -q "userId"; then
    echo "✅ Admin user created successfully!"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo "   Email: admin@volleyballclub.com"
else
    echo "ℹ️  Admin user may already exist or there was an issue:"
    echo "$RESPONSE"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo "   Quick Check-In: http://localhost:5173/checkin"
echo "   Staff Login: http://localhost:5173/login"
echo ""
echo "📚 To get started:"
echo "   1. Visit http://localhost:5173/login and login with admin/admin123"
echo "   2. Create some events in the Event Management section"
echo "   3. Use the Quick Check-In page for athlete check-ins"
echo ""
