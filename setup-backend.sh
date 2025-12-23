#!/bin/bash

echo "🚀 Setting up Backend..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || ! grep -q '"name": "server"' package.json; then
    echo "❌ Error: Must be run from server directory with package.json"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error installing dependencies"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating with correct PostgreSQL config..."
    cat > .env << EOF
DATABASE_URL="postgresql://esanz@localhost:5432/alquileres_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-12345"
EOF
    echo "✅ Created .env with PostgreSQL configuration for local development."
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Error generating Prisma client"
    exit 1
fi

# Sync database schema
echo "🗃️  Synchronizing database schema..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "⚠️  Database sync failed. Check your PostgreSQL configuration."
    echo "   Make sure PostgreSQL is running and database 'alquileres_db' exists."
    echo "   You can create it with: createdb alquileres_db"
fi

echo "✅ Backend setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev:full  # Runs dev server + type checking simultaneously"
