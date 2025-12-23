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
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
EOF
    echo "✅ Created .env template. Please edit with your database credentials."
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Error generating Prisma client"
    exit 1
fi

# Run migrations
echo "🗃️  Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "⚠️  Migration failed. You may need to reset the database or create initial migration."
    echo "   Run: npx prisma migrate dev --name init"
fi

echo "✅ Backend setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev:full  # Runs dev server + type checking simultaneously"
