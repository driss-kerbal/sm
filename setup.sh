#!/bin/bash

# Quick setup script for Student Management System

set -e

echo "📦 Student Management System - Setup"
echo "=================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your secret key"
fi

# Initialize database
echo ""
echo "🗄️  Initializing database..."
node -e "const db = require('better-sqlite3')('students.db'); db.exec(\`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT); CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY, firstName TEXT, lastName TEXT, email TEXT UNIQUE, phone TEXT, dateOfBirth TEXT, address TEXT, city TEXT, postalCode TEXT, country TEXT, enrollmentDate TEXT, status TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP);\`); db.close();"

echo ""
echo "✅ Setup completed!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "📚 To build for production:"
echo "   npm run build"
echo ""
echo "🌐 App will be available at:"
echo "   http://localhost:3000"
echo ""
echo "Demo credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
