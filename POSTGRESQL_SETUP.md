# PostgreSQL Migration Guide

## ✅ What's Changed

The application has been **migrated from SQLite to PostgreSQL** to work correctly on Vercel's serverless infrastructure.

### Why?
- **SQLite limitation**: Requires file system persistence, which Vercel's ephemeral serverless environment doesn't provide
- **PostgreSQL advantage**: Works perfectly with serverless functions, cloud-hosted databases, and Vercel

## 🚀 Local Development Setup

### Option 1: PostgreSQL Installed Locally

1. **Install PostgreSQL** (if not already installed)
   - Windows: https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql@15`
   - Linux: `sudo apt-get install postgresql`

2. **Create a local database**:
   ```bash
   createdb students_db
   ```

3. **Set environment variable** in `.env.local`:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/students_db
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

4. **Run the app**:
   ```bash
   npm run dev
   ```
   The database tables will be created automatically on first run.

### Option 2: PostgreSQL with Docker

1. **Add to docker-compose.yml**:
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: students_db
       ports:
         - "5432:5432"
   ```

2. **Start the container**:
   ```bash
   docker-compose up -d
   ```

3. **Set environment variable**:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/students_db
   ```

## ☁️ Production Setup on Vercel

### Option A: Vercel PostgreSQL (Recommended)

1. **Visit Vercel Dashboard**
2. **Navigate to Project → Storage**
3. **Create new → Postgres**
4. **Connect** - Environment variables are automatically added

### Option B: Neon (Free Tier)

1. **Create account**: https://neon.tech
2. **Create project** (free tier available)
3. **Copy connection string** to `.env.local` as `DATABASE_URL`
4. **Deploy** to Vercel

### Option C: Railway, Supabase, or Other Providers

1. **Create PostgreSQL database** with your provider
2. **Get connection string** (usually in format `postgresql://user:password@host:port/database`)
3. **Add to Vercel dashboard**:
   - Project Settings → Environment Variables
   - Key: `DATABASE_URL`
   - Value: Your PostgreSQL connection string
   - Environments: All (Production, Preview, Development)

## 🔧 Environment Variables Required

**Local Development (`.env.local`):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/students_db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key (generate with: openssl rand -base64 32)
```

**Production (Vercel Dashboard):**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - https://your-domain.vercel.app
- `NEXTAUTH_SECRET` - Same secret key as local

## 📊 Database Schema

Tables are created automatically on first run:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  dateOfBirth TEXT,
  address TEXT,
  city TEXT,
  postalCode TEXT,
  country TEXT,
  enrollmentDate TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Local Testing
```bash
# Run development server
npm run dev

# Visit http://localhost:3001 (or 3000)
# Check health endpoint: http://localhost:3001/api/health

# Login with demo credentials
Email: admin@example.com
Password: admin123
```

### Vercel Testing
1. **Check health endpoint**: `https://your-app.vercel.app/api/health`
2. **Try login page**: `https://your-app.vercel.app/login`
3. **Check runtime logs**: Vercel Dashboard → Deployments → [Latest] → Runtime Logs

## 🐛 Troubleshooting

### "unable to open database file" Error (Before Migration)
✅ **Fixed** - This was the original SQLite issue. PostgreSQL resolves it.

### "connection refused" Error
- Check if PostgreSQL service is running
- Verify connection string is correct
- Ensure firewall allows port 5432

### "database does not exist" Error
- Run: `createdb students_db` (local setup)
- Or create via your cloud provider's dashboard

### Tables not showing in production
- Check via `/api/health` endpoint
- Check Vercel Runtime Logs for errors
- Verify `DATABASE_URL` is set correctly

## 📝 Code Changes Summary

The following files were updated to use PostgreSQL:
- `lib/db.ts` - Now uses `pg` library with connection pooling
- `app/api/auth/[...nextauth]/route.ts` - Updated for async queries
- `app/api/setup/route.ts` - Updated for async queries
- `app/api/students/route.ts` - Updated for async queries
- `app/api/students/[id]/route.ts` - Updated for async queries
- `app/api/health/route.ts` - Updated for PostgreSQL diagnostics
- `package.json` - Added `pg` dependency

## ✨ Benefits

- ✅ Works on Vercel serverless
- ✅ Scalable to production load
- ✅ Data persistence across deployments
- ✅ Easy backups and maintenance
- ✅ Better performance for large datasets
- ✅ Connection pooling support
- ✅ Standard SQL interface

## 🚀 Next Steps

1. Set up PostgreSQL locally or use a cloud provider
2. Update `.env.local` with your `DATABASE_URL`
3. Run `npm install` to get the new `pg` dependency
4. Run `npm run dev` to test locally
5. Update Vercel environment variables
6. Redeploy on Vercel

Your application should now work perfectly on Vercel! 🎉
