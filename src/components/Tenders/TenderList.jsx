import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  DollarSign, 
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'

const TenderList = () => {
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('deadline')

  useEffect(() => {
    fetchTenders()
  }, [])

  const fetchTenders = async () => {
    try {
      const response = await axios.get('/api/tenders')
      setTenders(response.data.tenders)
    } catch (error) {
      console.error('Error fetching tenders:', error)
      // Use mock data for demo
      setTenders(getMockTenders())
    } finally {
      setLoading(false)
    }
  }

  const getMockTenders = () => [
    {
      id: 1,
      title: 'Highway Construction Project Phase 2',
      description: 'Construction of 25km highway section with bridges and interchanges',
      client: 'Department of Transportation',
      value: 4500000,
      deadline: '2024-02-15',
      status: 'active',
      riskScore: 0.3,
      profitPrediction: 0.18,
      submissionDate: '2024-01-10',
      category: 'Construction'
    },
    {
      id: 2,
      title: 'Smart City IoT Infrastructure',
      description: 'Implementation of IoT sensors and smart traffic management system',
      client: 'City Council',
      value: 1200000,
      deadline: '2024-01-30',
      status: 'won',
      riskScore: 0.2,
      profitPrediction: 0.22,
      submissionDate: '2023-12-15',
      category: 'Technology'
    },
    {
      id: 3,
      title: 'Hospital Equipment Procurement',
      description: 'Supply and installation of medical equipment for new wing',
      client: 'Regional Health Authority',
      value: 890000,
      deadline: '2024-03-01',
      status: 'pending',
      riskScore: 0.4,
      profitPrediction: 0.15,
      submissionDate: '2024-01-20',
      category: 'Healthcare'
    },
    {
      id: 4,
      title: 'Office Building Renovation',
      description: 'Complete renovation of 10-story office building including HVAC',
      client: 'Property Management Corp',
      value: 2800000,
      deadline: '2024-02-20',
      status: 'active',
      riskScore: 0.25,
      profitPrediction: 0.20,
      submissionDate: '2024-01-05',
      category: 'Construction'
    },
    {
      id: 5,
      title: 'Water Treatment Plant Upgrade',
      description: 'Modernization of water treatment facilities and equipment',
      client: 'Municipal Water Authority',
      value: 3200000,
      deadline: '2024-01-25',
      status: 'lost',
      riskScore: 0.5,
      profitPrediction: 0.12,
      submissionDate: '2023-12-20',
      category: 'Infrastructure'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'won': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'active': return <Clock className="w-5 h-5 text-blue-500" />
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'lost': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
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
    if (score <= 0.3) return 'text-green-600 bg-green-100'
    if (score <= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRiskLabel = (score) => {
    if (score <= 0.3) return 'Low'
    if (score <= 0.6) return 'Medium'
    return 'High'
  }

  const filteredTenders = tenders
    .filter(tender => {
      const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tender.client.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || tender.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline)
        case 'value':
          return b.value - a.value
        case 'risk':
          return a.riskScore - b.riskScore
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tender Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all your tender submissions</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Tender</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tenders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 pr-8"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="value">Sort by Value</option>
            <option value="risk">Sort by Risk</option>
          </select>
        </div>
      </div>

      {/* Tender List */}
      <div className="space-y-4">
        {filteredTenders.map((tender) => (
          <div key={tender.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Link 
                      to={`/tenders/${tender.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {tender.title}
                    </Link>
                    <p className="text-gray-600 mt-1">{tender.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {getStatusIcon(tender.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tender.status)}`}>
                      {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{tender.client}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      ${tender.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Due: {new Date(tender.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Category:</span>
                    <span className="text-sm font-medium text-gray-700">{tender.category}</span>
                  </div>
                </div>

                {/* AI Predictions */}
                <div className="flex items-center space-x-6 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Risk Level:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(tender.riskScore)}`}>
                      {getRiskLabel(tender.riskScore)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Profit Prediction:</span>
                    <span className="text-sm font-medium text-green-600">
                      {(tender.profitPrediction * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Submitted:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(tender.submissionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTenders.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tenders found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}

export default TenderList