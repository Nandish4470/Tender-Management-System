# Tender Management System

A free, open-source, locally-hosted tender management system with AI-powered insights and comprehensive document processing capabilities.

## 🚀 Features

### Core Functionality
- **Smart Dashboard** - Real-time analytics and tender overview
- **Tender Management** - Complete lifecycle management from submission to completion
- **Document Processing** - Advanced OCR with Tesseract and EasyOCR
- **ML-Driven Insights** - Risk assessment and profit prediction using Scikit-learn
- **Analytics & Reporting** - Comprehensive reports with Chart.js visualizations
- **User Management** - Secure authentication and profile management

### AI & Machine Learning
- **Risk Assessment** - ML-powered risk scoring for tender evaluation
- **Profit Prediction** - Automated profit margin forecasting
- **Document Analysis** - Intelligent text extraction from PDFs and images
- **Performance Analytics** - Historical data analysis and trend identification

### Security & Performance
- **Local Hosting** - Complete data privacy and control
- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Comprehensive data validation
- **CORS Protection** - Cross-origin request security

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Interactive data visualizations
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing

### Backend
- **Python Flask** - Lightweight web framework
- **SQLite/PostgreSQL** - Database options
- **Scikit-learn** - Machine learning algorithms
- **PyMuPDF** - PDF processing
- **Tesseract/EasyOCR** - Optical character recognition
- **ReportLab** - PDF report generation

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy and load balancing
- **Redis** - Caching (optional)

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **Tesseract OCR** (for document processing)

## 🚀 Quick Start

### One-Click Setup

```bash
# Clone the repository
git clone <repository-url>
cd tender-management-system

# Run the setup script
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Install Python dependencies:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Install system dependencies (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-eng
```

4. **Initialize the database:**
```bash
cd backend
python -c "from app import init_database; init_database()"
cd ..
```

5. **Start the application:**
```bash
# Terminal 1: Start backend
cd backend
python app.py

# Terminal 2: Start frontend
npm run dev
```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# With PostgreSQL
docker-compose --profile postgres up -d

# Production with Nginx
docker-compose --profile production up -d
```

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Documentation:** http://localhost:5000/api/docs

### Demo Credentials
- **Email:** demo@example.com
- **Password:** demo123

## 📁 Project Structure

```
tender-management-system/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   │   ├── Auth/               # Authentication components
│   │   ├── Dashboard/          # Dashboard components
│   │   ├── Tenders/           # Tender management
│   │   ├── Analytics/         # Analytics and reports
│   │   └── Layout/            # Layout components
│   ├── contexts/              # React contexts
│   └── utils/                 # Utility functions
├── backend/                     # Python Flask backend
│   ├── app.py                 # Main Flask application
│   ├── models/                # ML models storage
│   ├── uploads/               # Document uploads
│   └── requirements.txt       # Python dependencies
├── docker-compose.yml          # Docker configuration
├── setup.sh                   # One-click setup script
├── database_init.sql          # Database initialization
├── nginx.conf                 # Nginx configuration
└── docs/                      # Documentation
    ├── API_DOCS.md           # API documentation
    └── USER_GUIDE.md         # User guide
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
PORT=5000

# Database
DATABASE_URL=sqlite:///tender_management.db

# Upload Configuration
UPLOAD_FOLDER=backend/uploads
MAX_CONTENT_LENGTH=16777216

# ML Configuration
MODEL_PATH=backend/models
```

### Database Configuration

#### SQLite (Default)
No additional configuration required. Database file is created automatically.

#### PostgreSQL
Update the `DATABASE_URL` in your `.env` file:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/tender_management
```

## 🤖 Machine Learning Features

### Risk Assessment Model
- **Algorithm:** Random Forest Classifier
- **Features:** Tender value, deadline proximity, category, client history
- **Output:** Risk probability score (0-1)

### Profit Prediction Model
- **Algorithm:** Random Forest Regressor
- **Features:** Same as risk model
- **Output:** Predicted profit margin percentage

### Document Processing
- **PDF Processing:** PyMuPDF for text extraction
- **OCR:** Tesseract and EasyOCR for image-based documents
- **Text Analysis:** Keyword extraction and categorization

## 📊 Analytics & Reporting

### Dashboard Metrics
- Total tenders submitted
- Win rate percentage
- Total contract value
- Average profit margin
- Monthly trends

### Report Generation
- PDF reports with comprehensive analytics
- Export functionality for data analysis
- Custom date range filtering
- Category-wise performance analysis

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Session management
- Secure logout

### API Security
- Rate limiting (Flask-Limiter)
- CORS protection
- Input validation and sanitization
- SQL injection prevention

### Data Protection
- Local data storage
- No external data transmission
- Encrypted password storage
- Secure file upload handling

## 🚀 Deployment

### Local Development
```bash
npm run dev          # Frontend development server
python backend/app.py # Backend development server
```

### Production Build
```bash
npm run build        # Build frontend for production
```

### Docker Deployment
```bash
docker-compose up -d --build
```

### Manual Production Deployment
1. Build frontend: `npm run build`
2. Configure Nginx reverse proxy
3. Set up SSL certificates
4. Configure environment variables
5. Start services with process manager (PM2, systemd)

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tender Management
- `GET /api/tenders` - List user tenders
- `POST /api/tenders` - Create new tender
- `GET /api/tenders/:id` - Get tender details
- `PUT /api/tenders/:id` - Update tender
- `DELETE /api/tenders/:id` - Delete tender

### Document Management
- `POST /api/tenders/:id/documents` - Upload document
- `GET /api/documents/:id` - Download document
- `DELETE /api/documents/:id` - Delete document

### Analytics
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/analytics` - Analytics data
- `POST /api/reports/generate` - Generate PDF report

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**OCR not working:**
- Ensure Tesseract is installed: `tesseract --version`
- Install language packs: `sudo apt-get install tesseract-ocr-eng`

**Database connection errors:**
- Check database file permissions
- Verify SQLite installation
- For PostgreSQL, check connection string

**Port conflicts:**
- Frontend default: 3000
- Backend default: 5000
- Change ports in configuration files if needed

### Getting Help

1. Check the [User Guide](docs/USER_GUIDE.md)
2. Review [API Documentation](docs/API_DOCS.md)
3. Search existing issues
4. Create a new issue with detailed description

## 🎯 Roadmap

### Version 2.0
- [ ] Advanced ML models with deep learning
- [ ] Real-time collaboration features
- [ ] Mobile application
- [ ] Advanced document templates
- [ ] Integration with external APIs

### Version 2.1
- [ ] Multi-language support
- [ ] Advanced reporting dashboard
- [ ] Automated tender matching
- [ ] Email notifications
- [ ] Audit trail functionality

## 🏆 Acknowledgments

- **Tesseract OCR** - Google's OCR engine
- **EasyOCR** - Ready-to-use OCR with 80+ languages
- **Scikit-learn** - Machine learning library
- **React.js** - Frontend framework
- **Flask** - Python web framework
- **Chart.js** - Data visualization library

---

**Built with ❤️ for the open-source community**

*Free, secure, and locally-hosted tender management for everyone.*