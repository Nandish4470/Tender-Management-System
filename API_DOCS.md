# API Documentation

## Overview

The Tender Management System API provides comprehensive endpoints for managing tenders, documents, analytics, and user authentication. All endpoints use JSON for request and response bodies.

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General API calls:** 200 per day, 50 per hour
- **Login attempts:** 10 per minute
- **Registration:** 5 per minute

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "company": "Acme Corp"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp"
  }
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Missing required fields or invalid data
- `409` - Email already exists

### Login User

Authenticate user and receive JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp"
  }
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `400` - Missing email or password

### Get Current User

Get information about the currently authenticated user.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "phone": "+1234567890",
    "address": "123 Main St, City, State",
    "bio": "Experienced project manager"
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Invalid or expired token
- `404` - User not found

## Tender Management Endpoints

### List Tenders

Get all tenders for the authenticated user.

**Endpoint:** `GET /tenders`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional) - Filter by status: `active`, `won`, `lost`, `pending`
- `category` (optional) - Filter by category
- `limit` (optional) - Number of results (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response:**
```json
{
  "tenders": [
    {
      "id": 1,
      "title": "Highway Construction Project",
      "description": "Construction of 25km highway section",
      "client": "Department of Transportation",
      "value": 4500000,
      "deadline": "2024-02-15",
      "status": "active",
      "category": "Construction",
      "riskScore": 0.3,
      "profitPrediction": 0.18,
      "submissionDate": "2024-01-10",
      "createdAt": "2024-01-10T09:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

### Create Tender

Create a new tender.

**Endpoint:** `POST /tenders`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Office Building Renovation",
  "description": "Complete renovation of 10-story office building",
  "client": "Property Management Corp",
  "value": 2800000,
  "deadline": "2024-02-20",
  "category": "Construction"
}
```

**Response:**
```json
{
  "message": "Tender created successfully",
  "tender_id": 2,
  "risk_score": 0.25,
  "profit_prediction": 0.20
}
```

**Status Codes:**
- `201` - Tender created successfully
- `400` - Missing required fields
- `401` - Unauthorized

### Get Tender Details

Get detailed information about a specific tender.

**Endpoint:** `GET /tenders/{tender_id}`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "tender": {
    "id": 1,
    "title": "Highway Construction Project",
    "description": "Construction of 25km highway section with bridges",
    "client": "Department of Transportation",
    "value": 4500000,
    "deadline": "2024-02-15",
    "status": "active",
    "category": "Construction",
    "riskScore": 0.3,
    "profitPrediction": 0.18,
    "submissionDate": "2024-01-10",
    "requirements": [
      "Minimum 10 years experience in highway construction",
      "ISO 9001:2015 certification required"
    ],
    "timeline": [
      {
        "phase": "Design Phase",
        "duration": "3 months",
        "status": "completed"
      }
    ],
    "aiInsights": {
      "winProbability": 0.72,
      "competitorAnalysis": "Medium competition expected",
      "riskFactors": ["Weather dependency", "Material cost fluctuations"],
      "recommendations": ["Submit bid 2-3 days before deadline"]
    }
  },
  "documents": [
    {
      "id": 1,
      "name": "Tender_Specification.pdf",
      "size": "2.4 MB",
      "type": "specification",
      "uploadDate": "2024-01-10"
    }
  ]
}
```

### Update Tender

Update an existing tender.

**Endpoint:** `PUT /tenders/{tender_id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Highway Construction Project",
  "status": "won",
  "value": 4600000
}
```

**Response:**
```json
{
  "message": "Tender updated successfully",
  "tender": {
    "id": 1,
    "title": "Updated Highway Construction Project",
    "status": "won",
    "value": 4600000
  }
}
```

### Delete Tender

Delete a tender and all associated documents.

**Endpoint:** `DELETE /tenders/{tender_id}`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Tender deleted successfully"
}
```

**Status Codes:**
- `200` - Tender deleted successfully
- `404` - Tender not found
- `403` - Not authorized to delete this tender

## Document Management Endpoints

### Upload Document

Upload a document for a specific tender.

**Endpoint:** `POST /tenders/{tender_id}/documents`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
- `file` - The document file (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG)

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": 1,
    "filename": "specification.pdf",
    "size": 2457600,
    "type": "pdf",
    "extractedText": "This is the extracted text from the document..."
  }
}
```

**Status Codes:**
- `201` - Document uploaded successfully
- `400` - No file provided or invalid file type
- `413` - File too large (max 16MB)
- `404` - Tender not found

### Download Document

Download a specific document.

**Endpoint:** `GET /documents/{document_id}/download`

**Headers:** `Authorization: Bearer <token>`

**Response:** Binary file data

**Status Codes:**
- `200` - File downloaded successfully
- `404` - Document not found
- `403` - Not authorized to access this document

### Delete Document

Delete a document.

**Endpoint:** `DELETE /documents/{document_id}`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

## Analytics Endpoints

### Dashboard Statistics

Get dashboard statistics for the authenticated user.

**Endpoint:** `GET /dashboard/stats`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "stats": {
    "totalTenders": 156,
    "activeTenders": 23,
    "wonTenders": 45,
    "totalValue": 12450000,
    "winRate": 28.8,
    "avgProfitMargin": 15.2
  },
  "recentTenders": [
    {
      "id": 1,
      "title": "Highway Construction Project",
      "status": "active",
      "value": 450000,
      "deadline": "2024-02-15"
    }
  ],
  "chartData": {
    "monthlyTenders": {
      "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      "datasets": [
        {
          "label": "Tenders Submitted",
          "data": [12, 19, 15, 25, 22, 18]
        }
      ]
    }
  }
}
```

### Analytics Data

Get comprehensive analytics data.

**Endpoint:** `GET /analytics`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `range` - Time range: `3months`, `6months`, `12months`, `all`
- `metric` - Specific metric: `bids`, `revenue`, `winrate`, `all`

**Response:**
```json
{
  "summary": {
    "totalBids": 156,
    "winRate": 28.8,
    "totalValue": 12450000,
    "avgProfitMargin": 15.2,
    "trends": {
      "bids": 12,
      "winRate": -2.1,
      "value": 18.5,
      "profit": 3.2
    }
  },
  "charts": {
    "bidTrends": {
      "labels": ["Jan", "Feb", "Mar"],
      "datasets": [
        {
          "label": "Bids Submitted",
          "data": [12, 15, 18]
        }
      ]
    },
    "categoryPerformance": {
      "labels": ["Construction", "Technology", "Healthcare"],
      "datasets": [
        {
          "label": "Win Rate %",
          "data": [32, 25, 41]
        }
      ]
    }
  },
  "insights": [
    {
      "type": "positive",
      "title": "Strong Q3 Performance",
      "description": "Win rate increased by 15% in Q3"
    }
  ]
}
```

### Generate Report

Generate a PDF report with analytics data.

**Endpoint:** `POST /reports/generate`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "summary",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "includeCharts": true,
  "format": "pdf"
}
```

**Response:** PDF file download

**Status Codes:**
- `200` - Report generated successfully
- `400` - Invalid parameters
- `500` - Report generation failed

## Machine Learning Endpoints

### Predict Risk and Profit

Get ML predictions for tender parameters.

**Endpoint:** `POST /ml/predict`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "tenderValue": 1000000,
  "daysToDeadline": 30,
  "category": "Construction",
  "clientHistory": 0.7
}
```

**Response:**
```json
{
  "riskScore": 0.25,
  "profitPrediction": 0.18,
  "confidence": 0.85,
  "recommendations": [
    "Low risk tender with good profit potential",
    "Consider competitive pricing strategy"
  ]
}
```

### Analyze Document

Analyze uploaded document using ML.

**Endpoint:** `POST /ml/analyze-document`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
- `file` - Document file to analyze

**Response:**
```json
{
  "extractedText": "Full extracted text from document...",
  "keyTerms": ["construction", "highway", "bridge"],
  "estimatedValue": 2500000,
  "complexity": "high",
  "requirements": [
    "ISO certification required",
    "Minimum 5 years experience"
  ]
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid or expired token |
| `AUTH_002` | Missing authorization header |
| `AUTH_003` | Invalid credentials |
| `TENDER_001` | Tender not found |
| `TENDER_002` | Invalid tender data |
| `TENDER_003` | Unauthorized access to tender |
| `DOC_001` | Document not found |
| `DOC_002` | Invalid file type |
| `DOC_003` | File too large |
| `ML_001` | ML prediction failed |
| `ML_002` | Invalid input parameters |
| `RATE_001` | Rate limit exceeded |
| `SERVER_001` | Internal server error |

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `413` - Payload Too Large
- `429` - Too Many Requests
- `500` - Internal Server Error

## Examples

### Complete Tender Workflow

1. **Create a tender:**
```bash
curl -X POST http://localhost:5000/api/tenders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Construction Project",
    "client": "City Council",
    "value": 1500000,
    "deadline": "2024-03-01",
    "category": "Construction"
  }'
```

2. **Upload documents:**
```bash
curl -X POST http://localhost:5000/api/tenders/1/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@specification.pdf"
```

3. **Get analytics:**
```bash
curl -X GET http://localhost:5000/api/analytics \
  -H "Authorization: Bearer <token>"
```

### Authentication Flow

1. **Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "company": "Acme Corp"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

3. **Use token for authenticated requests:**
```bash
curl -X GET http://localhost:5000/api/tenders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

class TenderAPI {
  constructor(baseURL, token) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getTenders() {
    const response = await this.client.get('/tenders');
    return response.data;
  }

  async createTender(tenderData) {
    const response = await this.client.post('/tenders', tenderData);
    return response.data;
  }

  async uploadDocument(tenderId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post(
      `/tenders/${tenderId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }
}

// Usage
const api = new TenderAPI('http://localhost:5000/api', 'your-jwt-token');
const tenders = await api.getTenders();
```

### Python

```python
import requests
import json

class TenderAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_tenders(self):
        response = requests.get(f'{self.base_url}/tenders', headers=self.headers)
        return response.json()
    
    def create_tender(self, tender_data):
        response = requests.post(
            f'{self.base_url}/tenders',
            headers=self.headers,
            data=json.dumps(tender_data)
        )
        return response.json()
    
    def upload_document(self, tender_id, file_path):
        with open(file_path, 'rb') as file:
            files = {'file': file}
            headers = {'Authorization': self.headers['Authorization']}
            response = requests.post(
                f'{self.base_url}/tenders/{tender_id}/documents',
                headers=headers,
                files=files
            )
        return response.json()

# Usage
api = TenderAPI('http://localhost:5000/api', 'your-jwt-token')
tenders = api.get_tenders()
```

## Testing

Use the provided Postman collection or test with curl commands. All endpoints include comprehensive error handling and validation.

For more examples and detailed testing scenarios, see the `tests/` directory in the project repository.