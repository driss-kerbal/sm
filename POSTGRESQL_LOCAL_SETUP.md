# PostgreSQL Setup for Local Development

## Option 1: Using Docker (Recommended)

### Prerequisites
- Install Docker: https://www.docker.com/products/docker-desktop

### Steps

1. **Start PostgreSQL with Docker:**
   ```bash
   docker-compose up -d
   ```

2. **Verify the database is running:**
   ```bash
   docker-compose ps
   ```
   Should show `postgres` container as `UP`

3. **Check database connection:**
   ```bash
   docker exec -it sm-postgres-1 psql -U postgres -d students_db -c "SELECT 1"
   ```

4. **Start the app:**
   ```bash
   npm run dev
   ```

5. **Stop PostgreSQL:**
   ```bash
   docker-compose down
   ```

## Option 2: Using Neon (Cloud PostgreSQL)

1. **Create account:** https://neon.tech (free tier available)
2. **Create a project** and copy the connection string
3. **Update `.env.local`:**
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
   ```
4. **Start the app:**
   ```bash
   npm run dev
   ```

## Option 3: Local PostgreSQL Installation

### Windows
1. Download: https://www.postgresql.org/download/windows/
2. Install with default password: `postgres`
3. Create database:
   ```bash
   createdb students_db
   ```

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
createdb students_db
```

### Linux
```bash
sudo apt-get install postgresql postgresql-contrib
sudo su - postgres
createdb students_db
```

## Verify Connection

Test your DATABASE_URL with:
```bash
psql "postgresql://postgres:postgres@localhost:5432/students_db" -c "SELECT 1"
```

## Troubleshooting

### "connection refused" Error
- Make sure PostgreSQL is running
- Check if port 5432 is in use: `lsof -i :5432`
- Verify DATABASE_URL format

### "ECONNREFUSED" Error
- PostgreSQL service not running
- Wrong hostname/port
- Firewall blocking connection

### Can't create database
```bash
psql -U postgres -c "CREATE DATABASE students_db;"
```

## Environment Variables

The app uses `DATABASE_URL` to connect:
- **Local**: `postgresql://postgres:postgres@localhost:5432/students_db`
- **Neon**: Get from neon.tech dashboard
- **Vercel**: Set in Vercel Environment Variables

Tables are created automatically on first run.
