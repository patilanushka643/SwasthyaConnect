# Render Deployment Guide - SwasthyaConnect MERN Stack

**Version:** 1.0  
**Last Updated:** May 17, 2026  
**Platform:** Render.com  
**Environment:** Production

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Phase 1: Backend Deployment](#phase-1-backend-deployment)
3. [Phase 2: Frontend Deployment](#phase-2-frontend-deployment)
4. [Configuration Management](#configuration-management)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Local Verification

- [ ] All sensitive data (`.env` files) are in `.gitignore`
- [ ] No hardcoded API URLs in source code
- [ ] Backend tests pass locally
- [ ] Frontend builds without errors (`npm run build`)
- [ ] MongoDB Atlas cluster is created and accessible
- [ ] JWT secret is secure (minimum 32 characters)
- [ ] All environment variables are documented in `.env.example` files

### Repository Setup

- [ ] Git repository initialized: `git init`
- [ ] All files staged and committed: `git add . && git commit -m "Initial commit"`
- [ ] Repository pushed to GitHub/GitLab
- [ ] `.gitignore` is properly configured (verified with `git check-ignore -v`)

---

## 🚀 Phase 1: Backend Deployment

### Step 1.1: Prepare Backend for Render

#### Verify Dynamic Port Binding

The backend already includes production-ready port binding:

```javascript
// backend/server.js
const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${NODE_ENV.toUpperCase()}] SwasthyaConnect API Server`);
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${NODE_ENV}`);
});
```

**Key Features:**
- ✅ Listens on `0.0.0.0` (all network interfaces)
- ✅ Uses Render-provided `PORT` environment variable
- ✅ Fallback to port 5000 for local development
- ✅ Environment-aware logging

### Step 1.2: Create Backend Service on Render

1. **Login to Render:** https://render.com/
2. **Create New Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing SwasthyaConnect
   - Choose "Continue with GitHub"

3. **Configure Service:**
   - **Name:** `swasthyaconnect-api`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free tier or paid depending on requirements

4. **Add Environment Variables:**

   In Render dashboard → Environment:

   ```
   PORT=10000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/swasthyaconnect?retryWrites=true&w=majority
   JWT_SECRET=your-super-secure-production-secret-min-32-chars-long-replace-this-value-12345
   CLIENT_URL=https://swasthyaconnect.onrender.com
   ```

   **Production Secret Generation:**
   ```bash
   # Generate secure JWT secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Verify Build Output:**
   - Render will show deployment logs
   - Look for: `✓ Server running on port 10000`
   - Note the service URL (e.g., `https://swasthyaconnect-api.onrender.com`)

### Step 1.3: Backend Health Check

```bash
# Test health endpoint
curl https://swasthyaconnect-api.onrender.com/health

# Expected response:
# {"status":"ok","service":"SwasthyaConnect API"}
```

---

## 🎨 Phase 2: Frontend Deployment

### Step 2.1: Frontend Environment Configuration

The frontend uses intelligent environment detection:

```javascript
// frontend/src/context/AuthContext.jsx
const getAPIBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  const isDevelopment = import.meta.env.DEV;

  if (envURL) {
    return envURL.endsWith('/api/v1') ? envURL : `${envURL}/api/v1`;
  }

  return isDevelopment ? 'http://localhost:5000/api/v1' : '/api/v1';
};
```

**How It Works:**
- ✅ Production: Uses `VITE_API_URL` from `.env`
- ✅ Development: Defaults to `http://localhost:5000/api/v1`
- ✅ Handles both full URLs and path-only configurations
- ✅ Gracefully handles missing environment variables

### Step 2.2: Create Frontend Service on Render

1. **Create New Service:**
   - Click "New +" → "Static Site" (or "Web Service" for advanced control)
   - Connect same GitHub repository
   - Select repository

2. **Configure Service:**
   - **Name:** `swasthyaconnect`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
   - **Plan:** Free or Starter

3. **Add Environment Variables:**

   In Render dashboard → Environment:

   ```
   VITE_API_URL=https://swasthyaconnect-api.onrender.com/api/v1
   VITE_SOCKET_URL=https://swasthyaconnect-api.onrender.com
   ```

4. **Verify Build:**
   - Render will run build and publish static files
   - Check for `npm run build` success in logs
   - Frontend will be available at `https://swasthyaconnect.onrender.com`

### Step 2.3: Update Backend CORS

Ensure backend CORS allows frontend Render domain:

```javascript
// backend/server.js - already configured
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
```

The `CLIENT_URL` environment variable handles this automatically.

---

## ⚙️ Configuration Management

### Environment Variables Reference

#### Backend (`backend/.env` production)

```env
# Server
PORT=10000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/swasthyaconnect?retryWrites=true&w=majority

# Security
JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcd1234

# CORS & Frontend
CLIENT_URL=https://swasthyaconnect.onrender.com
```

#### Frontend (`frontend/.env` production)

```env
VITE_API_URL=https://swasthyaconnect-api.onrender.com/api/v1
VITE_SOCKET_URL=https://swasthyaconnect-api.onrender.com
```

### MongoDB Atlas Setup

1. **Create Cluster:**
   - Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas
   - Create new project: `SwasthyaConnect`
   - Create new cluster: `production`
   - Choose: AWS, us-east-1, M0 Sandbox (free)

2. **Configure Network Access:**
   - Security → Network Access
   - Add IP Address: `0.0.0.0/0` (allow all, production should be more restrictive)
   - OR whitelist Render IPs

3. **Create Database User:**
   - Security → Database Access
   - Add new user: `swasthya_user`
   - Set strong password (use generated password)
   - Grant role: `readWriteAnyDatabase`

4. **Get Connection String:**
   - Cluster → Connect → Connect your application
   - Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/swasthyaconnect`
   - Replace `<password>` with your database user password

5. **Test Connection:**
   ```bash
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/swasthyaconnect"
   ```

---

## ✅ Post-Deployment Verification

### Step 1: Health Checks

```bash
# Backend health
curl https://swasthyaconnect-api.onrender.com/health

# Expected: {"status":"ok","service":"SwasthyaConnect API"}
```

### Step 2: Frontend Accessibility

1. Open https://swasthyaconnect.onrender.com in browser
2. Verify page loads without errors
3. Check DevTools Console for any API connection errors

### Step 3: Authentication Flow

```bash
# Get API URL
API_URL="https://swasthyaconnect-api.onrender.com/api/v1"

# Test signup
curl -X POST $API_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@prod.com",
    "password":"testpass123",
    "role":"patient",
    "phone":"9876543210"
  }' | jq .

# Expected: Token and user object returned
```

### Step 4: Real-time Socket.io Connection

1. Login to frontend at https://swasthyaconnect.onrender.com
2. Open DevTools → Network → WebSocket
3. Verify WebSocket connection to backend is established
4. Look for: `wss://swasthyaconnect-api.onrender.com/socket.io/`

### Step 5: Database Verification

```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/swasthyaconnect"

# In mongosh shell:
use swasthyaconnect
db.users.findOne()
db.appointments.findOne()
```

---

## 🔍 Troubleshooting

### Issue: Frontend Cannot Connect to Backend

**Symptom:** Console error: `Failed to fetch from API`

**Solution:**
1. Verify `VITE_API_URL` is correctly set in frontend environment
2. Check backend service is running (visit health endpoint)
3. Verify CORS is properly configured
4. Check backend logs for errors

```bash
# Frontend console test
const API = "https://swasthyaconnect-api.onrender.com/api/v1";
fetch(API + "/health")
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e));
```

### Issue: MongoDB Connection Timeout

**Symptom:** `MongooseError: connect ECONNREFUSED`

**Solution:**
1. Verify MongoDB Atlas cluster is running
2. Check network access whitelist includes Render IPs
3. Confirm `MONGO_URI` is correctly formatted
4. Test connection locally:
   ```bash
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/swasthyaconnect"
   ```

### Issue: Socket.io WebSocket Connection Fails

**Symptom:** WebSocket connections stuck in pending

**Solution:**
1. Verify `VITE_SOCKET_URL` matches backend domain
2. Check backend CORS includes frontend domain
3. Render free tier may have WebSocket limitations — consider upgrade
4. Test: Browser → DevTools → Network → Filter by `wss`

### Issue: Build Failure on Render

**Symptom:** `npm ERR! ...` in build logs

**Solution:**
1. Verify `package.json` exists in correct directories
2. Check for `npm-shrinkwrap.json` conflicts
3. Clear Render build cache:
   - Go to Service → Settings → Clear Build Cache
   - Redeploy service
4. Test build locally:
   ```bash
   cd backend && npm install && npm start
   cd frontend && npm install && npm run build
   ```

### Issue: Port Already in Use

**Symptom:** `EADDRINUSE: address already in use :::5000`

**Solution:**
- This shouldn't happen on Render (they assign PORT)
- Locally, use: `lsof -i :5000` and kill the process
- Or change PORT in `.env`

---

## 🔐 Security Best Practices for Production

### Environment Variables

✅ **DO:**
- Store all secrets in Render Environment Variables dashboard
- Use cryptographically secure random values for `JWT_SECRET`
- Rotate secrets every 90 days
- Never commit `.env` to Git

❌ **DON'T:**
- Hard-code secrets in code
- Use simple passwords (use generated strings)
- Share environment variable values in logs

### MongoDB Security

✅ **DO:**
- Enable IP Whitelist (restrict to Render IPs only in production)
- Use strong database user passwords
- Enable MongoDB Atlas encryption at rest
- Use TLS for connections

❌ **DON'T:**
- Allow `0.0.0.0/0` access in production
- Use default credentials
- Expose database URLs in error messages

### CORS Configuration

✅ **Correct:**
```javascript
origin: process.env.CLIENT_URL || '*'  // Production: specific domain
```

❌ **Avoid:**
```javascript
origin: '*'  // Too permissive for production
```

---

## 📊 Monitoring & Logs

### Access Backend Logs

**On Render Dashboard:**
1. Go to Service: `swasthyaconnect-api`
2. Click "Logs"
3. View real-time application output

### Monitor Key Metrics

- Server startup time
- Database connection status
- API response times
- Error rates
- WebSocket connection count

### Example Log Monitoring

```bash
# Check logs for startup
[PRODUCTION] SwasthyaConnect API Server
✓ Server running on port 10000
✓ Environment: production
✓ Client URL: https://swasthyaconnect.onrender.com
✓ MongoDB: Connected
```

---

## 🚀 Deployment Summary

| Component | Status | URL |
|-----------|--------|-----|
| Backend API | ✓ Deployed | https://swasthyaconnect-api.onrender.com |
| Frontend | ✓ Deployed | https://swasthyaconnect.onrender.com |
| Database | ✓ Configured | MongoDB Atlas (Cloud) |
| Health Check | ✓ Passing | `/health` endpoint |

---

## 📝 Next Steps

1. **Monitor:** Keep watching Render dashboard for the first 24 hours
2. **Test:** Run through complete QA suite from `QA_TESTING_MANUAL.md`
3. **Backup:** Set up MongoDB Atlas automated backups
4. **Scale:** Upgrade Render plan if performance needs arise
5. **Update:** Monitor for dependency updates and security patches

---

## 📞 Quick Reference Commands

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test backend connectivity
curl https://swasthyaconnect-api.onrender.com/health

# Test API endpoint
curl -X POST https://swasthyaconnect-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@swasthya.com","password":"patient123"}'

# MongoDB connection test
mongosh "mongodb+srv://username:password@cluster.mongodb.net/swasthyaconnect"
```

---

**Deployment Complete!** 🎉

Your SwasthyaConnect MERN application is now live on Render with production-grade configuration.

