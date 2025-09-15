import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Building2, 
  FileText, 
  Download,
  Upload,
  AlertTriangle,
  TrendingUp,
  Target,
  Clock
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

const TenderDetail = () => {
  const { id } = useParams()
  const [tender, setTender] = useState(null)
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    fetchTenderDetail()
  }, [id])

  const fetchTenderDetail = async () => {
    try {
      const response = await axios.get(`/api/tenders/${id}`)
      setTender(response.data.tender)
      setDocuments(response.data.documents || [])
    } catch (error) {
      console.error('Error fetching tender detail:', error)
      // Use mock data for demo
      setTender(getMockTenderDetail())
      setDocuments(getMockDocuments())
    } finally {
      setLoading(false)
    }
  }

  const getMockTenderDetail = () => ({
    id: parseInt(id),
    title: 'Highway Construction Project Phase 2',
    description: 'Construction of 25km highway section with bridges and interchanges. This project involves complex engineering requirements including environmental considerations, traffic management during construction, and integration with existing infrastructure.',
    client: 'Department of Transportation',
    value: 4500000,
    deadline: '2024-02-15',
    status: 'active',
    riskScore: 0.3,
    profitPrediction: 0.18,
    submissionDate: '2024-01-10',
    category: 'Construction',
    requirements: [
      'Minimum 10 years experience in highway construction',
      'ISO 9001:2015 certification required',
      'Environmental impact assessment completion',
      'Traffic management plan submission',
      'Local subcontractor engagement (minimum 30%)'
    ],
    timeline: [
      { phase: 'Design Phase', duration: '3 months', status: 'completed' },
      { phase: 'Environmental Approval', duration: '2 months', status: 'completed' },
      { phase: 'Construction Phase 1', duration: '8 months', status: 'in-progress' },
      { phase: 'Construction Phase 2', duration: '6 months', status: 'pending' },
      { phase: 'Final Inspection', duration: '1 month', status: 'pending' }
    ],
    aiInsights: {
      winProbability: 0.72,
      competitorAnalysis: 'Medium competition expected (3-4 bidders)',
      riskFactors: [
        'Weather dependency for construction timeline',
        'Potential material cost fluctuations',
        'Environmental compliance requirements'
      ],
      recommendations: [
        'Submit bid 2-3 days before deadline for optimal timing',
        'Emphasize local partnership and environmental expertise',
        'Consider weather contingency in timeline planning'
      ]
    }
  })

  const getMockDocuments = () => [
    { id: 1, name: 'Tender_Specification.pdf', size: '2.4 MB', type: 'specification', uploadDate: '2024-01-10' },
    { id: 2, name: 'Technical_Drawings.pdf', size: '15.8 MB', type: 'drawings', uploadDate: '2024-01-10' },
    { id: 3, name: 'Environmental_Report.pdf', size: '5.2 MB', type: 'report', uploadDate: '2024-01-12' },
    { id: 4, name: 'Cost_Estimate.xlsx', size: '1.1 MB', type: 'estimate', uploadDate: '2024-01-15' }
  ]

  const onDrop = (acceptedFiles) => {
    // Handle file upload
    console.log('Files to upload:', acceptedFiles)
    // In a real app, you would upload these files to your backend
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!tender) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tender not found</h3>
        <Link to="/tenders" className="text-primary-600 hover:text-primary-700">
          Back to Tenders
        </Link>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'won': return 'text-green-600 bg-green-100'
      case 'active': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'lost': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskColor = (score) => {
    if (score <= 0.3) return 'text-green-600'
    if (score <= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/tenders"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{tender.title}</h1>
          <p className="text-gray-600 mt-1">{tender.client}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(tender.status)}`}>
          {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Tender Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${tender.value.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Deadline</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(tender.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Win Probability</p>
              <p className="text-2xl font-bold text-purple-600">
                {(tender.aiInsights.winProbability * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-sm text-gray-600">Profit Prediction</p>
              <p className="text-2xl font-bold text-emerald-600">
                {(tender.profitPrediction * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
            <p className="text-gray-700 leading-relaxed">{tender.description}</p>
          </div>

          {/* Requirements */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
            <ul className="space-y-2">
              {tender.requirements.map((req, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
            <div className="space-y-4">
              {tender.timeline.map((phase, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                    phase.status === 'completed' ? 'bg-green-500' :
                    phase.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{phase.phase}</span>
                      <span className="text-sm text-gray-600">{phase.duration}</span>
                    </div>
                    <span className={`text-sm ${
                      phase.status === 'completed' ? 'text-green-600' :
                      phase.status === 'in-progress' ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {phase.status.charAt(0).toUpperCase() + phase.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            
            {/* Upload Area */}
            <div 
              {...getRootProps()} 
              className={`file-upload-area mb-6 ${isDragActive ? 'drag-active' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">
                {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports PDF, DOC, DOCX, XLS, XLSX
              </p>
            </div>

            {/* Document List */}
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-600">
                        {doc.size} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              AI Insights
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-primary-800 mb-1">Competition Level</p>
                <p className="text-sm text-primary-700">{tender.aiInsights.competitorAnalysis}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-primary-800 mb-2">Risk Factors</p>
                <ul className="space-y-1">
                  {tender.aiInsights.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-primary-700 flex items-start">
                      <span className="w-1 h-1 bg-primary-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-medium text-primary-800 mb-2">Recommendations</p>
                <ul className="space-y-1">
                  {tender.aiInsights.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-primary-700 flex items-start">
                      <span className="w-1 h-1 bg-primary-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                Generate Proposal
              </button>
              <button className="w-full btn-secondary">
                Export Analysis
              </button>
              <button className="w-full btn-secondary">
                Set Reminder
              </button>
            </div>
          </div>

          {/* Project Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-900">{tender.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium text-gray-900">
                  {new Date(tender.submissionDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Risk Level:</span>
                <span className={`font-medium ${getRiskColor(tender.riskScore)}`}>
                  {tender.riskScore <= 0.3 ? 'Low' : tender.riskScore <= 0.6 ? 'Medium' : 'High'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TenderDetail