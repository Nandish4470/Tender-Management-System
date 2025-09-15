#!/bin/bash

# Tender Management System Setup Script
# Free, open-source tender management with ML-driven insights

set -e

echo "🚀 Setting up Tender Management System..."
echo "======================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    echo "Please install Python 3.8 or higher and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js 16 or higher and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    echo "Please install npm and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create virtual environment for Python backend
echo "📦 Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Install system dependencies for OCR (Ubuntu/Debian)
if command -v apt-get &> /dev/null; then
    echo "📦 Installing system dependencies for OCR..."
    sudo apt-get update
    sudo apt-get install -y tesseract-ocr tesseract-ocr-eng
    sudo apt-get install -y libgl1-mesa-glx libglib2.0-0
fi

# Install system dependencies for OCR (macOS)
if command -v brew &> /dev/null; then
    echo "📦 Installing system dependencies for OCR (macOS)..."
    brew install tesseract
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/uploads
mkdir -p backend/models
mkdir -p logs

# Set up environment variables
echo "⚙️  Setting up environment variables..."
if [ ! -f .env ]; then
    cat > .env << EOL
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production-$(openssl rand -hex 32)
PORT=5000

# Database Configuration
DATABASE_URL=sqlite:///tender_management.db

# Upload Configuration
UPLOAD_FOLDER=backend/uploads
MAX_CONTENT_LENGTH=16777216

# ML Configuration
MODEL_PATH=backend/models

# Logging
LOG_LEVEL=INFO
EOL
    echo "✅ Environment file created"
else
    echo "✅ Environment file already exists"
fi

# Initialize database
echo "🗄️  Initializing database..."
cd backend
python -c "
import sys
sys.path.append('.')
from app import init_database
init_database()
print('Database initialized successfully')
"
cd ..

# Build frontend
echo "🏗️  Building frontend..."
npm run build

echo ""
echo "🎉 Setup completed successfully!"
echo "======================================"
echo ""
echo "To start the application:"
echo "1. Start the backend server:"
echo "   cd backend && python app.py"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   npm run dev"
echo ""
echo "3. Open your browser and navigate to:"
echo "   http://localhost:3000"
echo ""
echo "Demo credentials:"
echo "   Email: demo@example.com"
echo "   Password: demo123"
echo ""
echo "📚 Documentation:"
echo "   - README.md - General information"
echo "   - API_DOCS.md - API documentation"
echo "   - USER_GUIDE.md - User guide"
echo ""
echo "🐳 Docker alternative:"
echo "   docker-compose up -d"
echo ""
echo "Happy tender management! 🎯"