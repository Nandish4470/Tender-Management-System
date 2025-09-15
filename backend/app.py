#!/usr/bin/env python3
"""
Tender Management System Backend
Free, open-source tender management with ML-driven insights
"""

import os
import sys
import logging
from datetime import datetime, timedelta
from functools import wraps
import jwt
import bcrypt
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import sqlite3
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pickle
import io
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import cv2
import easyocr
import json
from werkzeug.utils import secure_filename
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize CORS
CORS(app, origins=['http://localhost:3000'])

# Initialize rate limiter
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database initialization
def init_database():
    """Initialize SQLite database with required tables"""
    conn = sqlite3.connect('tender_management.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            company TEXT,
            phone TEXT,
            address TEXT,
            bio TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tenders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tenders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            client TEXT,
            value REAL,
            deadline DATE,
            status TEXT DEFAULT 'active',
            category TEXT,
            risk_score REAL,
            profit_prediction REAL,
            submission_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Documents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tender_id INTEGER,
            filename TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            file_size INTEGER,
            file_type TEXT,
            extracted_text TEXT,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tender_id) REFERENCES tenders (id)
        )
    ''')
    
    # Analytics table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            metric_name TEXT,
            metric_value REAL,
            date DATE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user_id, *args, **kwargs)
    return decorated

# ML Models
class TenderMLModels:
    def __init__(self):
        self.risk_model = None
        self.profit_model = None
        self.scaler = StandardScaler()
        self.load_or_train_models()
    
    def load_or_train_models(self):
        """Load existing models or train new ones"""
        try:
            with open('models/risk_model.pkl', 'rb') as f:
                self.risk_model = pickle.load(f)
            with open('models/profit_model.pkl', 'rb') as f:
                self.profit_model = pickle.load(f)
            with open('models/scaler.pkl', 'rb') as f:
                self.scaler = pickle.load(f)
            logger.info("ML models loaded successfully")
        except FileNotFoundError:
            logger.info("Training new ML models...")
            self.train_models()
    
    def train_models(self):
        """Train ML models with sample data"""
        # Generate sample training data
        np.random.seed(42)
        n_samples = 1000
        
        # Features: tender_value, days_to_deadline, category_encoded, client_history
        X = np.random.rand(n_samples, 4)
        X[:, 0] = X[:, 0] * 10000000  # tender value
        X[:, 1] = X[:, 1] * 365  # days to deadline
        X[:, 2] = np.random.randint(0, 5, n_samples)  # category (0-4)
        X[:, 3] = np.random.rand(n_samples)  # client history score
        
        # Generate realistic targets
        risk_scores = np.random.beta(2, 5, n_samples)  # Risk scores (0-1)
        profit_margins = np.random.normal(0.15, 0.05, n_samples)  # Profit margins
        profit_margins = np.clip(profit_margins, 0, 0.5)
        
        # Train models
        X_scaled = self.scaler.fit_transform(X)
        
        self.risk_model = RandomForestClassifier(n_estimators=100, random_state=42)
        risk_labels = (risk_scores > 0.5).astype(int)
        self.risk_model.fit(X_scaled, risk_labels)
        
        self.profit_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.profit_model.fit(X_scaled, profit_margins)
        
        # Save models
        os.makedirs('models', exist_ok=True)
        with open('models/risk_model.pkl', 'wb') as f:
            pickle.dump(self.risk_model, f)
        with open('models/profit_model.pkl', 'wb') as f:
            pickle.dump(self.profit_model, f)
        with open('models/scaler.pkl', 'wb') as f:
            pickle.dump(self.scaler, f)
        
        logger.info("ML models trained and saved successfully")
    
    def predict_risk_and_profit(self, tender_value, days_to_deadline, category, client_history=0.5):
        """Predict risk score and profit margin for a tender"""
        try:
            # Encode category
            category_map = {'Construction': 0, 'Technology': 1, 'Healthcare': 2, 'Infrastructure': 3, 'Education': 4}
            category_encoded = category_map.get(category, 0)
            
            # Prepare features
            features = np.array([[tender_value, days_to_deadline, category_encoded, client_history]])
            features_scaled = self.scaler.transform(features)
            
            # Make predictions
            risk_prob = self.risk_model.predict_proba(features_scaled)[0][1]
            profit_margin = self.profit_model.predict(features_scaled)[0]
            
            return float(risk_prob), float(max(0, profit_margin))
        except Exception as e:
            logger.error(f"Error in ML prediction: {e}")
            return 0.3, 0.15  # Default values

# Document processing
class DocumentProcessor:
    def __init__(self):
        self.ocr_reader = easyocr.Reader(['en'])
    
    def extract_text_from_pdf(self, file_path):
        """Extract text from PDF using PyMuPDF"""
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            return ""
    
    def extract_text_from_image(self, file_path):
        """Extract text from image using EasyOCR"""
        try:
            result = self.ocr_reader.readtext(file_path)
            text = " ".join([item[1] for item in result])
            return text
        except Exception as e:
            logger.error(f"Error extracting text from image: {e}")
            return ""
    
    def process_document(self, file_path, file_type):
        """Process document and extract text"""
        if file_type.lower() == 'pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_type.lower() in ['jpg', 'jpeg', 'png', 'tiff']:
            return self.extract_text_from_image(file_path)
        else:
            return ""

# Initialize ML models and document processor
ml_models = TenderMLModels()
doc_processor = DocumentProcessor()

# API Routes

@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        company = data.get('company', '')
        
        if not all([name, email, password]):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Insert user into database
        conn = sqlite3.connect('tender_management.db')
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO users (name, email, password_hash, company)
                VALUES (?, ?, ?, ?)
            ''', (name, email, password_hash, company))
            user_id = cursor.lastrowid
            conn.commit()
        except sqlite3.IntegrityError:
            return jsonify({'message': 'Email already exists'}), 400
        finally:
            conn.close()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=30)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user_id,
                'name': name,
                'email': email,
                'company': company
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not all([email, password]):
            return jsonify({'message': 'Missing email or password'}), 400
        
        # Check user credentials
        conn = sqlite3.connect('tender_management.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, email, password_hash, company FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user[3]):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user[0],
            'exp': datetime.utcnow() + timedelta(days=30)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user[0],
                'name': user[1],
                'email': user[2],
                'company': user[4]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user_id):
    """Get current user information"""
    try:
        conn = sqlite3.connect('tender_management.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, email, company, phone, address, bio FROM users WHERE id = ?', (current_user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user[0],
                'name': user[1],
                'email': user[2],
                'company': user[3],
                'phone': user[4],
                'address': user[5],
                'bio': user[6]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get user error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user_id):
    """Get dashboard statistics"""
    try:
        conn = sqlite3.connect('tender_management.db')
        cursor = conn.cursor()
        
        # Get tender statistics
        cursor.execute('SELECT COUNT(*) FROM tenders WHERE user_id = ?', (current_user_id,))
        total_tenders = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM tenders WHERE user_id = ? AND status = "active"', (current_user_id,))
        active_tenders = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM tenders WHERE user_id = ? AND status = "won"', (current_user_id,))
        won_tenders = cursor.fetchone()[0]
        
        cursor.execute('SELECT SUM(value) FROM tenders WHERE user_id = ? AND status = "won"', (current_user_id,))
        total_value = cursor.fetchone()[0] or 0
        
        conn.close()
        
        # Calculate win rate
        win_rate = (won_tenders / total_tenders * 100) if total_tenders > 0 else 0
        
        return jsonify({
            'stats': {
                'totalTenders': total_tenders,
                'activeTenders': active_tenders,
                'wonTenders': won_tenders,
                'totalValue': total_value,
                'winRate': round(win_rate, 1),
                'avgProfitMargin': 15.2  # Mock data
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Dashboard stats error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/tenders', methods=['GET'])
@token_required
def get_tenders(current_user_id):
    """Get user's tenders"""
    try:
        conn = sqlite3.connect('tender_management.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, title, description, client, value, deadline, status, 
                   category, risk_score, profit_prediction, submission_date
            FROM tenders 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ''', (current_user_id,))
        
        tenders = []
        for row in cursor.fetchall():
            tenders.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'client': row[3],
                'value': row[4],
                'deadline': row[5],
                'status': row[6],
                'category': row[7],
                'riskScore': row[8],
                'profitPrediction': row[9],
                'submissionDate': row[10]
            })
        
        conn.close()
        
        return jsonify({'tenders': tenders}), 200
        
    except Exception as e:
        logger.error(f"Get tenders error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/tenders', methods=['POST'])
@token_required
def create_tender(current_user_id):
    """Create a new tender"""
    try:
        data = request.get_json()
        
        title = data.get('title')
        description = data.get('description')
        client = data.get('client')
        value = data.get('value')
        deadline = data.get('deadline')
        category = data.get('category', 'Other')
        
        if not all([title, client, value, deadline]):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Calculate days to deadline
        deadline_date = datetime.strptime(deadline, '%Y-%m-%d')
        days_to_deadline = (deadline_date - datetime.now()).days
        
        # Get ML predictions
        risk_score, profit_prediction = ml_models.predict_risk_and_profit(
            value, days_to_deadline, category
        )
        
        # Insert tender into database
        conn = sqlite3.connect('tender_management.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO tenders (user_id, title, description, client, value, deadline, 
                               category, risk_score, profit_prediction, submission_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (current_user_id, title, description, client, value, deadline, 
              category, risk_score, profit_prediction, datetime.now().date()))
        
        tender_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Tender created successfully',
            'tender_id': tender_id,
            'risk_score': risk_score,
            'profit_prediction': profit_prediction
        }), 201
        
    except Exception as e:
        logger.error(f"Create tender error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/tenders/<int:tender_id>', methods=['GET'])
@token_required
def get_tender_detail(current_user_id, tender_id):
    """Get detailed tender information"""
    try:
        conn = sqlite3.connect('tender_management.db')
        cursor = conn.cursor()
        
        # Get tender details
        cursor.execute('''
            SELECT id, title, description, client, value, deadline, status, 
                   category, risk_score, profit_prediction, submission_date
            FROM tenders 
            WHERE id = ? AND user_id = ?
        ''', (tender_id, current_user_id))
        
        tender_row = cursor.fetchone()
        if not tender_row:
            return jsonify({'message': 'Tender not found'}), 404
        
        # Get associated documents
        cursor.execute('''
            SELECT id, original_filename, file_size, file_type, upload_date
            FROM documents 
            WHERE tender_id = ?
        ''', (tender_id,))
        
        documents = []
        for doc_row in cursor.fetchall():
            documents.append({
                'id': doc_row[0],
                'name': doc_row[1],
                'size': f"{doc_row[2] / 1024 / 1024:.1f} MB" if doc_row[2] else "Unknown",
                'type': doc_row[3],
                'uploadDate': doc_row[4]
            })
        
        conn.close()
        
        tender = {
            'id': tender_row[0],
            'title': tender_row[1],
            'description': tender_row[2],
            'client': tender_row[3],
            'value': tender_row[4],
            'deadline': tender_row[5],
            'status': tender_row[6],
            'category': tender_row[7],
            'riskScore': tender_row[8],
            'profitPrediction': tender_row[9],
            'submissionDate': tender_row[10]
        }
        
        return jsonify({
            'tender': tender,
            'documents': documents
        }), 200
        
    except Exception as e:
        logger.error(f"Get tender detail error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/tenders/<int:tender_id>/documents', methods=['POST'])
@token_required
def upload_document(current_user_id, tender_id):
    """Upload document for a tender"""
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        # Verify tender ownership
        conn = sqlite3.connect('tender_management.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM tenders WHERE id = ? AND user_id = ?', (tender_id, current_user_id))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'message': 'Tender not found'}), 404
        
        # Save file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{tender_id}_{filename}")
        file.save(file_path)
        
        # Extract text from document
        file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        extracted_text = doc_processor.process_document(file_path, file_extension)
        
        # Save document info to database
        cursor.execute('''
            INSERT INTO documents (tender_id, filename, original_filename, file_size, file_type, extracted_text)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (tender_id, f"{tender_id}_{filename}", filename, os.path.getsize(file_path), file_extension, extracted_text))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Document uploaded successfully'}), 201
        
    except Exception as e:
        logger.error(f"Upload document error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/analytics', methods=['GET'])
@token_required
def get_analytics(current_user_id):
    """Get analytics data"""
    try:
        # Mock analytics data for demo
        analytics_data = {
            'summary': {
                'totalBids': 156,
                'winRate': 28.8,
                'totalValue': 12450000,
                'avgProfitMargin': 15.2,
                'trends': {
                    'bids': 12,
                    'winRate': -2.1,
                    'value': 18.5,
                    'profit': 3.2
                }
            }
        }
        
        return jsonify(analytics_data), 200
        
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/reports/generate', methods=['POST'])
@token_required
def generate_report(current_user_id):
    """Generate PDF report"""
    try:
        data = request.get_json()
        report_type = data.get('type', 'summary')
        
        # Create PDF report
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title = Paragraph("Tender Management Report", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Summary section
        summary_title = Paragraph("Executive Summary", styles['Heading1'])
        story.append(summary_title)
        
        summary_text = """
        This report provides a comprehensive overview of your tender management activities.
        Key metrics include bid success rates, profit margins, and risk assessments.
        """
        summary_para = Paragraph(summary_text, styles['Normal'])
        story.append(summary_para)
        story.append(Spacer(1, 12))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        
        return send_file(
            buffer,
            as_attachment=True,
            download_name=f'tender_report_{datetime.now().strftime("%Y%m%d")}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"Generate report error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'message': 'Rate limit exceeded'}), 429

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    # Create demo user if not exists
    try:
        conn = sqlite3.connect('tender_management.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', ('demo@example.com',))
        if not cursor.fetchone():
            password_hash = bcrypt.hashpw('demo123'.encode('utf-8'), bcrypt.gensalt())
            cursor.execute('''
                INSERT INTO users (name, email, password_hash, company)
                VALUES (?, ?, ?, ?)
            ''', ('Demo User', 'demo@example.com', password_hash, 'Demo Company'))
            conn.commit()
            logger.info("Demo user created")
        conn.close()
    except Exception as e:
        logger.error(f"Error creating demo user: {e}")
    
    # Start Flask app
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Tender Management System on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)