# 🚨 Production Login/Signup Fix Guide

## Problem Summary

Your login/signup was failing in production because:

1. ❌ **CORS blocked** - Backend only allowed `localhost:5173`
2. ❌ **Weak JWT secret** - Using default placeholder
3. ⚠️ **Missing env vars** - Production domain not configured

---

## ✅ Fixes Applied

### 1. **CORS Configuration Fixed**

**File:** `backend/src/server.ts`

- ✅ Now reads allowed origins from `ALLOWED_ORIGINS` environment variable
- ✅ Supports multiple domains (production + localhost)
- ✅ Logs blocked requests for debugging

### 2. **Docker Compose Updated**

**File:** `docker-compose.yml`

- ✅ Added `ALLOWED_ORIGINS` environment variable
- ✅ Added `VITE_API_URL` build arg
- ✅ Improved security settings

### 3. **Environment Template Created**

**File:** `.env.production.example`

- ✅ Template for production variables

---

## 🚀 Deployment Steps

### Step 1: Set Production Environment Variables

On your production server, create `.env` file:

```bash
# Create .env file
nano .env
```

Add these variables (replace with your actual values):

```env
# YOUR PRODUCTION DOMAIN (CRITICAL!)
ALLOWED_ORIGINS=https://beastmovies.site,https://www.beastmovies.site

# Generate strong JWT secret
JWT_SECRET=YOUR_64_CHAR_RANDOM_STRING_HERE

# Database
POSTGRES_USER=beastuser
POSTGRES_PASSWORD=YOUR_STRONG_DB_PASSWORD
POSTGRES_DB=beastmovies
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# TMDB API
VITE_TMDB_API_KEY=your_tmdb_api_key

# Production mode
NODE_ENV=production
BCRYPT_ROUNDS=12
```

### Step 2: Generate Strong Secrets

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate database password
openssl rand -base64 32
```

### Step 3: Rebuild & Deploy

```bash
# Pull latest code
git pull origin main

# Rebuild containers
docker-compose down
docker-compose up --build -d

# Check logs
docker-compose logs -f backend
```

### Step 4: Verify

Test the health endpoint:

```bash
curl https://your-domain.com/api/health
# Should return: {"status":"ok"}
```

Test from browser:
1. Open https://your-domain.com
2. Click "Sign Up"
3. Fill in form
4. Should work without "Something went wrong" error

---

## 🔍 Debugging

### Check Backend Logs

```bash
docker-compose logs backend --tail=100
```

Look for:
- ✅ `Server running on port 8085`
- ✅ Successful database connection
- ❌ CORS errors (shows blocked origin)

### Check CORS

```bash
# Test CORS from your domain
curl -H "Origin: https://beastmovies.site" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-domain.com/api/auth/login -v
```

Should see:
```
< Access-Control-Allow-Origin: https://beastmovies.site
< Access-Control-Allow-Credentials: true
```

### Common Issues

#### Issue: Still getting "Something went wrong"

**Check:**
1. ALLOWED_ORIGINS includes your exact domain (with https://)
2. Backend container restarted after .env changes
3. No typos in domain name
4. Includes both www and non-www versions if needed

**Debug:**
```bash
# Check environment variables in container
docker-compose exec backend env | grep ALLOWED_ORIGINS

# Should show your production domain
```

#### Issue: CORS still blocking

**Verify nginx is proxying correctly:**

```bash
# Inside frontend container
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Should see:
# location /api {
#     proxy_pass http://backend:8085;
# }
```

#### Issue: Database connection failed

**Check:**
```bash
# Test database
docker-compose exec postgres psql -U beastuser -d beastmovies -c "SELECT 1;"

# Should return 1
```

---

## 🔐 Security Checklist

Before going live:

- [ ] Changed `JWT_SECRET` from default
- [ ] Changed `POSTGRES_PASSWORD` from default  
- [ ] Set `NODE_ENV=production`
- [ ] Set `BCRYPT_ROUNDS=12` (higher = more secure, slower)
- [ ] Added your production domain to `ALLOWED_ORIGINS`
- [ ] Enabled HTTPS (SSL certificate)
- [ ] Firewall allows only ports 80, 443
- [ ] Regular backups configured

---

## 📊 What Changed in Code

### Before (Broken in Production):

```typescript
// backend/src/server.ts
app.use(cors({
    origin: 'http://localhost:5173', // ❌ Hardcoded!
    credentials: true,
}));
```

### After (Works in Production):

```typescript
// backend/src/server.ts
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
```

---

## 🎯 Testing Checklist

After deployment, test:

- [ ] Sign up with new account (should work)
- [ ] Login with that account (should work)
- [ ] Logout (should work)
- [ ] Add movie to favorites (should work)
- [ ] Add movie to watchlist (should work)
- [ ] Continue watching tracking (should work)
- [ ] Search functionality (should work)
- [ ] Watch a movie/episode (should work)

---

## 💡 Quick Reference

### Environment Variables Priority:

1. **ALLOWED_ORIGINS** - CRITICAL for production
2. **JWT_SECRET** - CRITICAL for security
3. **POSTGRES_PASSWORD** - Important for security
4. **VITE_TMDB_API_KEY** - Required for content
5. **NODE_ENV** - Good practice

### Production Domain Examples:

```env
# Single domain
ALLOWED_ORIGINS=https://beastmovies.site

# Multiple domains (no spaces!)
ALLOWED_ORIGINS=https://beastmovies.site,https://www.beastmovies.site,https://app.beastmovies.site

# Include localhost for testing
ALLOWED_ORIGINS=https://beastmovies.site,http://localhost:5173
```

---

## 🆘 Still Having Issues?

1. **Check backend logs:**
   ```bash
   docker-compose logs backend --tail=50
   ```

2. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for CORS errors

3. **Test backend directly:**
   ```bash
   curl -X POST https://your-domain.com/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"username":"test","password":"test123"}' \
        -v
   ```

4. **Verify environment:**
   ```bash
   docker-compose exec backend printenv | grep -E "ALLOWED_ORIGINS|JWT_SECRET|NODE_ENV"
   ```

---

**Your login/signup should now work in production! 🎉**
