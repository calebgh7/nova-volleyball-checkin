#!/bin/bash

# Comprehensive Test Script for Volleyball Check-In System
echo "🏐 Testing Volleyball Check-In System"
echo "====================================="

API_BASE="http://localhost:3001/api"
FRONTEND_BASE="http://localhost:5173"

# Test 1: Health Check
echo "🔍 Test 1: Health Check"
HEALTH=$(curl -s $API_BASE/health)
if echo "$HEALTH" | grep -q "OK"; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Test 2: Frontend Accessibility
echo ""
echo "🔍 Test 2: Frontend Accessibility"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_BASE)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible (HTTP $FRONTEND_STATUS)"
fi

# Test 3: User Authentication
echo ""
echo "🔍 Test 3: User Authentication"

# Login and get token
LOGIN_RESPONSE=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","password":"test123"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ Login successful"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "   Token obtained: ${TOKEN:0:20}..."
else
    echo "❌ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
fi

# Test 4: Create Sample Event
echo ""
echo "🔍 Test 4: Create Sample Event"

EVENT_DATA='{
  "name": "Tuesday Night Open Gym",
  "description": "Weekly open gym for all skill levels",
  "date": "'$(date +%Y-%m-%d)'",
  "startTime": "19:00",
  "endTime": "21:00",
  "maxCapacity": 20
}'

EVENT_RESPONSE=$(curl -s -X POST $API_BASE/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$EVENT_DATA")

if echo "$EVENT_RESPONSE" | grep -q "Event created successfully"; then
    echo "✅ Event creation successful"
    EVENT_ID=$(echo "$EVENT_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "   Event ID: $EVENT_ID"
else
    echo "❌ Event creation failed"
    echo "   Response: $EVENT_RESPONSE"
fi

# Test 5: Create Sample Athlete
echo ""
echo "🔍 Test 5: Create Sample Athlete"

ATHLETE_DATA='{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "phone": "555-0123",
  "dateOfBirth": "1995-05-15",
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "555-0124",
  "hasValidWaiver": true,
  "waiverExpirationDate": "'$(date -v +1y +%Y-%m-%d)'"
}'

ATHLETE_RESPONSE=$(curl -s -X POST $API_BASE/athletes \
  -H "Content-Type: application/json" \
  -d "$ATHLETE_DATA")

if echo "$ATHLETE_RESPONSE" | grep -q "Athlete created successfully"; then
    echo "✅ Athlete creation successful"
    ATHLETE_ID=$(echo "$ATHLETE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "   Athlete ID: $ATHLETE_ID"
else
    echo "❌ Athlete creation failed"
    echo "   Response: $ATHLETE_RESPONSE"
fi

# Test 6: Test Check-in
echo ""
echo "🔍 Test 6: Test Check-in Process"

if [ -n "$ATHLETE_ID" ] && [ -n "$EVENT_ID" ]; then
    CHECKIN_DATA='{
      "athleteId": "'$ATHLETE_ID'",
      "eventId": "'$EVENT_ID'",
      "notes": "Test check-in from automated script"
    }'

    CHECKIN_RESPONSE=$(curl -s -X POST $API_BASE/checkins \
      -H "Content-Type: application/json" \
      -d "$CHECKIN_DATA")

    if echo "$CHECKIN_RESPONSE" | grep -q "Check-in successful"; then
        echo "✅ Check-in successful"
        if echo "$CHECKIN_RESPONSE" | grep -q "waiver validated"; then
            echo "   ✅ Waiver validated during check-in"
        else
            echo "   ⚠️  Waiver validation warning"
        fi
    else
        echo "❌ Check-in failed"
        echo "   Response: $CHECKIN_RESPONSE"
    fi
else
    echo "❌ Cannot test check-in (missing athlete or event ID)"
fi

# Test 7: Search Athletes
echo ""
echo "🔍 Test 7: Search Athletes"

SEARCH_RESPONSE=$(curl -s "$API_BASE/athletes/search?query=John")

if echo "$SEARCH_RESPONSE" | grep -q "John"; then
    echo "✅ Athlete search working"
    ATHLETE_COUNT=$(echo "$SEARCH_RESPONSE" | grep -o '"firstName"' | wc -l | tr -d ' ')
    echo "   Found $ATHLETE_COUNT athlete(s)"
else
    echo "❌ Athlete search failed"
    echo "   Response: $SEARCH_RESPONSE"
fi

# Test 8: Get Today's Events
echo ""
echo "🔍 Test 8: Get Today's Events"

TODAY_EVENTS=$(curl -s $API_BASE/events/today)

if echo "$TODAY_EVENTS" | grep -q "events"; then
    echo "✅ Today's events endpoint working"
    EVENT_COUNT=$(echo "$TODAY_EVENTS" | grep -o '"name"' | wc -l | tr -d ' ')
    echo "   Found $EVENT_COUNT event(s) for today"
else
    echo "❌ Today's events endpoint failed"
fi

# Test 9: Get Check-in Statistics
echo ""
echo "🔍 Test 9: Get Check-in Statistics"

STATS_RESPONSE=$(curl -s $API_BASE/checkins/stats \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS_RESPONSE" | grep -q "today"; then
    echo "✅ Statistics endpoint working"
    TODAY_COUNT=$(echo "$STATS_RESPONSE" | grep -o '"today":[0-9]*' | cut -d':' -f2)
    echo "   Today's check-ins: $TODAY_COUNT"
else
    echo "❌ Statistics endpoint failed"
    echo "   Response: $STATS_RESPONSE"
fi

# Test 10: Test Protected Route
echo ""
echo "🔍 Test 10: Test Protected Route (without token)"

PROTECTED_RESPONSE=$(curl -s $API_BASE/athletes)

if echo "$PROTECTED_RESPONSE" | grep -q "No token provided"; then
    echo "✅ Protected routes are properly secured"
else
    echo "❌ Protected routes are not properly secured"
    echo "   Response: $PROTECTED_RESPONSE"
fi

echo ""
echo "🎉 Testing Complete!"
echo ""
echo "🌐 You can now test the frontend manually at:"
echo "   • Main App: $FRONTEND_BASE"
echo "   • Check-in Page: $FRONTEND_BASE/checkin"
echo "   • Staff Login: $FRONTEND_BASE/login"
echo ""
echo "🔑 Use these credentials to login:"
echo "   Username: testadmin"
echo "   Password: test123"
echo ""
echo "📝 Sample data created:"
echo "   • Event: Tuesday Night Open Gym (today)"
echo "   • Athlete: John Doe (with valid waiver)"
echo "   • Check-in: John Doe checked into the event"
echo ""
