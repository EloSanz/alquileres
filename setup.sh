#!/bin/bash

echo "🚀 Setting up Full Stack Application..."

# Check if we have the required directories
if [ ! -d "server" ]; then
    echo "❌ Error: server directory not found"
    exit 1
fi

if [ ! -d "web" ]; then
    echo "❌ Error: web directory not found"
    exit 1
fi

# Make scripts executable
chmod +x setup-backend.sh
chmod +x setup-frontend.sh

# Setup backend
echo "🔧 Setting up Backend..."
cd server
bash ../setup-backend.sh

if [ $? -ne 0 ]; then
    echo "❌ Backend setup failed"
    exit 1
fi

cd ..

# Setup frontend
echo "🎨 Setting up Frontend..."
cd web
bash ../setup-frontend.sh

if [ $? -ne 0 ]; then
    echo "❌ Frontend setup failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Full stack setup complete!"
echo ""
echo "🚀 To start development:"
echo "   cd server && npm run dev:full    # Backend"
echo "   cd web && npm run dev:full       # Frontend"
echo ""
echo "📱 Application will be available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
