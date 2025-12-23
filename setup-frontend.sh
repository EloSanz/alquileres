#!/bin/bash

echo "🚀 Setting up Frontend..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || ! grep -q '"name": "web"' package.json; then
    echo "❌ Error: Must be run from web directory with package.json"
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
VITE_API_URL="http://localhost:3000"
EOF
    echo "✅ Created .env template."
fi

echo "✅ Frontend setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev:full  # Runs dev server + type checking simultaneously"
