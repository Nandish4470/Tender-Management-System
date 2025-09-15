import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import axios from 'axios'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats')
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Use mock data for demo
      setDashboardData(getMockDashboardData())
    } finally {
      setLoading(false)
    }
  }

  const getMockDashboardData = () => ({
    stats: {
      totalTenders: 156,
      activeTenders: 23,
      wonTenders: 45,
      totalValue: 2450000,
      winRate: 28.8,
      avgProfitMargin: 15.2
    },
    recentTenders: [
      { id: 1, title: 'Highway Construction Project', status: 'active', value: 450000, deadline: '2024-02-15' },
      { id: 2, title: 'Office Building Renovation', status: 'won', value: 280000, deadline: '2024-01-30' },
      { id: 3, title: 'IT Infrastructure Upgrade', status: 'pending', value: 120000, deadline: '2024-02-20' },
      { id: 4, title: 'Water Treatment Plant', status: 'active', value: 890000, deadline: '2024-03-01' },
    ],
    chartData: {
      monthlyTenders: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Tenders Submitted',
          data: [12, 19, 15, 25, 22, 18],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      },
      tenderStatus: {
        labels: ['Won', 'Lost', 'Active', 'Pending'],
        datasets: [{
          data: [45, 67, 23, 21],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ]
        }]
      },
      profitAnalysis: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Profit Margin %',
          data: [12.5, 15.2, 18.7, 16.3],
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        }]
      }
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const { stats, recentTenders, chartData } = dashboardData

  const statCards = [
    {
      title: 'Total Tenders',
      value: stats.totalTenders,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Tenders',
      value: stats.activeTenders,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '+5%'
    },
    {
      title: 'Won Tenders',
      value: stats.wonTenders,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Value',
      value: `$${(stats.totalValue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate}%`,
      icon: Target,
      color: 'bg-indigo-500',
      change: '+3%'
    },
    {
      title: 'Avg Profit Margin',
      value: `${stats.avgProfitMargin}%`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: '+2%'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'won': return 'text-green-600 bg-green-100'
      case 'active': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'lost': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Tender Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your tender management activities</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Tenders Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Tender Activity</h3>
          <div className="chart-container">
            <Line 
              data={chartData.monthlyTenders}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Tender Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tender Status Distribution</h3>
          <div className="chart-container">
            <Doughnut 
              data={chartData.tenderStatus}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Analysis */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Profit Analysis</h3>
          <div className="chart-container">
            <Bar 
              data={chartData.profitAnalysis}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return value + '%'
                      }
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Recent Tenders */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Tenders</h3>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentTenders.map((tender) => (
              <div key={tender.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{tender.title}</h4>
                  <p className="text-sm text-gray-600">Deadline: {tender.deadline}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-gray-900">
                    ${tender.value.toLocaleString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tender.status)}`}>
                    {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="flex items-start space-x-4">
          <div className="bg-primary-600 p-3 rounded-full">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary-900 mb-2">AI-Powered Insights</h3>
            <div className="space-y-2 text-sm text-primary-800">
              <p>• Your win rate has improved by 3% this quarter - consider bidding on similar projects</p>
              <p>• High-value construction tenders show 85% success rate - focus on this sector</p>
              <p>• Optimal bid timing: Submit 2-3 days before deadline for best results</p>
              <p>• Risk assessment suggests avoiding tenders with less than 30-day timelines</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard