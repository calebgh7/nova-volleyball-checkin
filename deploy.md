# 🚀 Deploy Nova Volleyball Check-In App to Render

## Quick Deployment Steps

### 1. Sign up for Render (Free)
1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with your GitHub account

### 2. Connect Your Repository
1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub account if not already connected
4. Search for and select `nova-volleyball-checkin` repository

### 3. Configure Deployment
Use these settings when creating the web service:

**Basic Settings:**
- **Name**: `nova-volleyball-checkin`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build && npm run build:server`
- **Start Command**: `npm run start:prod`

**Advanced Settings:**
- **Auto-Deploy**: `Yes` (deploys automatically when you push to main branch)

### 4. Environment Variables
Add these environment variables in Render:
- `NODE_ENV` = `production`
- `JWT_SECRET` = `your-super-secret-jwt-key-here` (generate a random 32+ character string)

### 5. Deploy!
1. Click "Create Web Service"
2. Render will automatically build and deploy your app
3. Wait for the build to complete (usually 3-5 minutes)
4. Your app will be available at: `https://nova-volleyball-checkin.onrender.com`

## Alternative: One-Click Deploy

You can also use this button for one-click deployment:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/calebgh7/nova-volleyball-checkin)

## What Happens During Deployment

1. **Build Process**: Render will run the build commands to compile your React frontend and TypeScript backend
2. **Database**: SQLite database will be created automatically on first run
3. **Static Files**: React app will be served by the Express server
4. **SSL**: Render provides free SSL certificates automatically

## Accessing Your Deployed App

Once deployed, you can:
- **Check-In Interface**: Visit the main URL
- **Admin Panel**: Go to `/login` and use the credentials you set up
- **Staff Functions**: Manage athletes, events, and check-ins

## Managing Your Deployment

- **View Logs**: Check the "Logs" tab in Render dashboard
- **Monitor**: Use the "Metrics" tab to see performance
- **Environment**: Update environment variables in "Environment" tab
- **Redeploy**: Push to main branch or use "Manual Deploy" button

## Troubleshooting

If deployment fails:
1. Check the build logs in Render dashboard
2. Ensure all dependencies are in package.json
3. Verify environment variables are set correctly
4. Check that the start command works locally

## Free Tier Limitations

Render's free tier includes:
- ✅ 750 hours/month (enough for full-time hosting)
- ✅ Free SSL certificates
- ✅ Automatic deployments from GitHub
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ Cold start delay (30-60 seconds) when waking up

## Keeping Your App Active

To minimize cold starts:
1. Use a service like UptimeRobot to ping your app every 14 minutes
2. Or upgrade to Render's paid plan for always-on hosting ($7/month)

## Need Help?

If you encounter issues:
1. Check the deployment logs in Render
2. Review this guide
3. Contact support through Render's help center
