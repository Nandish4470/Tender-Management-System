import React, { useState, useEffect } from 'react'
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
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  Download,
  Filter,
  BarChart3
} from 'lucide-react'
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

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('12months')
  const [selectedMetric, setSelectedMetric] = useState('all')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange, selectedMetric])

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get(`/api/analytics?range=${timeRange}&metric=${selectedMetric}`)
      setAnalyticsData(response.data)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      // Use mock data for demo
      setAnalyticsData(getMockAnalyticsData())
    } finally {
      setLoading(false)
    }
  }

  const getMockAnalyticsData = () => ({
    summary: {
      totalBids: 156,
      winRate: 28.8,
      totalValue: 12450000,
      avgProfitMargin: 15.2,
      trends: {
        bids: 12,
        winRate: -2.1,
        value: 18.5,
        profit: 3.2
      }
    },
    charts: {
      bidTrends: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Bids Submitted',
            data: [12, 15, 18, 14, 22, 19, 25, 21, 18, 24, 20, 16],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          },
          {
            label: 'Bids Won',
            data: [3, 4, 6, 4, 7, 5, 8, 6, 5, 7, 6, 4],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          }
        ]
      },
      categoryPerformance: {
        labels: ['Construction', 'Technology', 'Healthcare', 'Infrastructure', 'Education'],
        datasets: [{
          label: 'Win Rate %',
          data: [32, 25, 41, 28, 35],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ]
        }]
      },
      valueDistribution: {
        labels: ['<$100K', '$100K-$500K', '$500K-$1M', '$1M-$5M', '>$5M'],
        datasets: [{
          data: [25, 45, 35, 28, 12],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ]
        }]
      },
      riskVsProfit: {
        datasets: [{
          label: 'Tenders',
          data: [
            { x: 0.2, y: 18 },
            { x: 0.3, y: 22 },
            { x: 0.15, y: 25 },
            { x: 0.4, y: 12 },
            { x: 0.25, y: 20 },
            { x: 0.35, y: 15 },
            { x: 0.1, y: 28 },
            { x: 0.45, y: 8 },
            { x: 0.3, y: 19 },
            { x: 0.2, y: 24 }
          ],
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
        }]
      },
      monthlyRevenue: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue ($)',
          data: [450000, 520000, 680000, 420000, 890000, 650000, 1200000, 780000, 560000, 920000, 740000, 480000],
          backgroundColor: 'rgba(34, 197, 94, 0.8)'
        }]
      }
    },
    insights: [
      {
        type: 'positive',
        title: 'Strong Q3 Performance',
        description: 'Win rate increased by 15% in Q3, with particularly strong performance in construction projects.'
      },
      {
        type: 'warning',
        title: 'Technology Sector Opportunity',
        description: 'Technology sector shows lower win rate but higher profit margins. Consider strategic focus.'
      },
      {
        type: 'info',
        title: 'Optimal Bid Timing',
        description: 'Analysis shows 23% higher success rate when bids are submitted 2-3 days before deadline.'
      }
    ]
  })

  const exportReport = () => {
    // In a real app, this would generate and download a PDF report
    console.log('Exporting analytics report...')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const { summary, charts, insights } = analyticsData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your tender performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="all">All Time</option>
          </select>
          <button onClick={exportReport} className="btn-primary flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bids</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalBids}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{summary.trends.bids}%</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{summary.winRate}%</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">{summary.trends.winRate}%</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(summary.totalValue / 1000000).toFixed(1)}M
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{summary.trends.value}%</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">{summary.avgProfitMargin}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{summary.trends.profit}%</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-emerald-100">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bid Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bid Trends Over Time</h3>
          <div className="chart-container">
            <Line 
              data={charts.bidTrends}
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

        {/* Category Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Win Rate by Category</h3>
          <div className="chart-container">
            <Bar 
              data={charts.categoryPerformance}
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

        {/* Value Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tender Value Distribution</h3>
          <div className="chart-container">
            <Doughnut 
              data={charts.valueDistribution}
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

        {/* Risk vs Profit Analysis */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk vs Profit Analysis</h3>
          <div className="chart-container">
            <Scatter 
              data={charts.riskVsProfit}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Risk Score'
                    },
                    min: 0,
                    max: 0.5
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Profit Margin (%)'
                    },
                    beginAtZero: true
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
        <div className="chart-container">
          <Bar 
            data={charts.monthlyRevenue}
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
                      return '$' + (value / 1000) + 'K'
                    }
                  }
                },
              },
            }}
          />
        </div>
      </div>

      {/* AI Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              insight.type === 'positive' ? 'bg-green-50 border-green-400' :
              insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
              'bg-blue-50 border-blue-400'
            }`}>
              <h4 className={`font-semibold ${
                insight.type === 'positive' ? 'text-green-800' :
                insight.type === 'warning' ? 'text-yellow-800' :
                'text-blue-800'
              }`}>
                {insight.title}
              </h4>
              <p className={`text-sm mt-1 ${
                insight.type === 'positive' ? 'text-green-700' :
                insight.type === 'warning' ? 'text-yellow-700' :
                'text-blue-700'
              }`}>
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics