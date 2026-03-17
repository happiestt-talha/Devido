#!/bin/bash

echo "🔥 Devido Backend Refactor - Quick Setup"
echo "========================================"
echo ""

# Check if models exist in old server
if [ ! -d "../server/models" ]; then
    echo "❌ Error: Cannot find ../server/models directory"
    echo "Please make sure you're running this from devido-backend-refactored folder"
    exit 1
fi

# Copy models
echo "📁 Copying models from old server..."
cp ../server/models/User.js ./models/ 2>/dev/null
cp ../server/models/Video.js ./models/ 2>/dev/null
cp ../server/models/Comments.js ./models/ 2>/dev/null

if [ -f "./models/User.js" ]; then
    echo "✅ Models copied successfully"
else
    echo "⚠️  Could not copy models. Please copy them manually:"
    echo "   cp ../server/models/*.js ./models/"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env created. Please edit it with your actual values:"
    echo "   - MONGO_URI"
    echo "   - JWT_SECRET"
    echo "   - CLOUDINARY_* (optional for now)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your MongoDB URI and JWT secret"
echo "  2. Run: npm run dev"
echo "  3. Test: curl http://localhost:5000"
echo ""
echo "See REFACTOR_GUIDE.md for detailed instructions"
