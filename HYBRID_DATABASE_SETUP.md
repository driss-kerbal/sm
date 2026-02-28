# Hybrid Database Setup - SQLite & PostgreSQL

## Overview

The Student Management System now supports **both SQLite and PostgreSQL** for maximum flexibility:

- **SQLite**: Used for **local development** (no external dependencies)
- **PostgreSQL**: Used for **production/Vercel deployment** (scalable, reliable)

The system **automatically detects** which database to use based on the `DATABASE_URL` environment variable.

## Architecture

### Database Selection Logic

```
If DATABASE_URL is set → Use PostgreSQL
If DATABASE_URL is NOT set → Use SQLite (default)
```

### Unified Query Interface

Both databases use the same `query()` function in `lib/db.ts`:
- **PostgreSQL**: Uses `pg` library with connection pooling
- **SQLite**: Uses `better-sqlite3` with automatic syntax conversion

The system **automatically converts** PostgreSQL syntax to SQLite-compatible syntax:
- `$1, $2, $3` parameters → `?, ?, ?` placeholders
- `SERIAL PRIMARY KEY` → `INTEGER PRIMARY KEY AUTOINCREMENT`
- `TIMESTAMP` → `DATETIME`

## Local Development Setup (SQLite)

### Quick Start

1. **No setup required!** SQLite is file-based and auto-initializes.

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Access the app**:
   ```
   http://localhost:3000
   ```

4. **Database file** is created automatically at:
   ```
   ./students.db
   ```

### Default Credentials

- **Email**: `admin@example.com`
- **Password**: `admin123`

### Key Files

- `lib/db.ts` - Database abstraction layer
- `students.db` - SQLite database file (auto-created)
- `.env.local` - Should NOT have `DATABASE_URL` set (uses SQLite)

## Production Setup (PostgreSQL)

### Vercel Deployment

1. **Set environment variable** in Vercel Dashboard:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

2. **Automatic switching**: App detects `DATABASE_URL` and uses PostgreSQL

3. **Tables auto-created**: On first request, all tables are initialized

### Example DATABASE_URL

```
postgresql://postgres:postgres@localhost:5432/students_db     # Local PostgreSQL
postgresql://user:pass@vercel-postgres-host:5432/mydatabase   # Vercel PostgreSQL
```

## Environment Variables

### `.env.local` Example

```dotenv
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=WoKvw5RMjR8m/wOaS08OZOEWrNI/5UGWhSivEyZovDc=
# Leave DATABASE_URL uncommented to use SQLite
# DATABASE_URL=postgresql://user:pass@localhost:5432/students_db
```

### `.env.production` Example

```dotenv
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<your-secret>
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## API Endpoints

All endpoints work with both SQLite and PostgreSQL:

### Health & Setup
- `GET /api/health` - Check database status
- `GET /api/setup` - Initialize database

### Authentication
- `POST /api/auth/signin` - Sign in
- `GET /api/auth/session` - Get session
- `POST /api/auth/signout` - Sign out

### Students CRUD (localhost auth-disabled for testing)
- `GET /api/students` - List all students
- `POST /api/students` - Create student
- `GET /api/students/[id]` - Get student by ID
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

## Testing

### Run API Test Suite

```bash
npm run dev    # In one terminal

# In another terminal
node test-api-complete.js
```

### Test Coverage

- ✅ Health check
- ✅ Database initialization
- ✅ Authentication (signin/signout)
- ✅ Student CRUD operations
- ✅ Error handling
- ✅ Multiple database support

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Students Table

```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Switching Databases

### Local → PostgreSQL

```bash
# Edit .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/students_db

# Restart app
npm run dev
```

### PostgreSQL → Local SQLite

```bash
# Edit .env.local
# DATABASE_URL=...  (comment out or remove)

# Delete old SQLite file (optional)
rm students.db

# Restart app
npm run dev
```

## File Structure

```
lib/
  └── db.ts                    # Database abstraction layer
app/api/
  ├── health/route.ts          # Health check endpoint
  ├── setup/route.ts           # Database initialization
  ├── students/
  │   ├── route.ts             # GET/POST students
  │   └── [id]/route.ts        # GET/PUT/DELETE specific student
  └── auth/
      └── [...nextauth]/route.ts # Authentication
  
students.db                    # SQLite database (auto-created)
package.json                   # better-sqlite3 & pg dependencies
```

## Troubleshooting

### Issue: "Database not found"

**SQLite**: Delete `students.db` and restart app
```bash
rm students.db
npm run dev
```

**PostgreSQL**: Verify `DATABASE_URL` and database exists
```bash
psql -U postgres -c "CREATE DATABASE students_db;"
```

### Issue: Port 3000 in use

```bash
# Kill process using port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or on Windows PowerShell
Stop-Process -Name node -Force
```

### Issue: "UNIQUE constraint failed"

This means trying to insert duplicate email. Use unique test data:
```javascript
email: `student${Date.now()}@example.com`
```

## Performance Considerations

### SQLite (Local)
- ✅ No external dependencies
- ✅ File-based, very fast for dev
- ✅ Auto-persists to disk
- ❌ Not suitable for production serverless

### PostgreSQL (Production)
- ✅ Reliable for production
- ✅ Connection pooling
- ✅ Scales well
- ❌ Requires external database

## Dependencies

```json
{
  "pg": "^8.19.0",
  "better-sqlite3": "^12.6.2",
  "next-auth": "^4.24.13",
  "bcryptjs": "^3.0.3"
}
```

## Next Steps

1. **Local Testing**: Run `npm run dev` with SQLite
2. **Deploy to Vercel**: Set `DATABASE_URL` environment variable
3. **Monitor**: Check `/api/health` endpoint for database status
4. **Scale**: PostgreSQL handles scale automatically

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
node test-api-complete.js

# Reset SQLite database
rm students.db && npm run dev

# Check database health
curl http://localhost:3000/api/health

# Initialize database
curl http://localhost:3000/api/setup
```

## Support

For issues or questions:
1. Check `/api/health` endpoint
2. Review server logs in terminal
3. Verify environment variables
4. Check GitHub issues

---

**Last Updated**: February 28, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
