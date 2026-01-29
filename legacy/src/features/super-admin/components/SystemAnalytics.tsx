import { useState, useEffect } from 'react'
import { Users, University, BookOpen, MessageSquare, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { SuperAdminService } from '../services/superAdminService'
import { Card, StatsCard, Table } from '../../../shared/components/ui'

interface AnalyticsData {
  overview: {
    total_universities: number
    total_users: number
    total_sessions: number
    total_responses: number
    total_faculties: number
    total_departments: number
    total_courses: number
    active_sessions_today: number
    responses_today: number
    overall_response_rate: number
  }
  usersByRole: Record<string, number>
  trends: Record<string, {
    current: number
    previous: number
    growth: number
    direction: 'up' | 'down'
  }>
  universityMetrics: Array<{
    university_id: string
    university_name: string
    total_sessions: number
    total_responses: number
    active_teachers: number
    active_students: number
    response_rate: number
    avg_session_duration: number
    last_activity: string
  }>
}

export default function SystemAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: {
      total_universities: 0,
      total_users: 0,
      total_sessions: 0,
      total_responses: 0,
      total_faculties: 0,
      total_departments: 0,
      total_courses: 0,
      active_sessions_today: 0,
      responses_today: 0,
      overall_response_rate: 0
    },
    usersByRole: {},
    trends: {},
    universityMetrics: []
  })
  const [billingReport, setBillingReport] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showBilling, setShowBilling] = useState(false)

  useEffect(() => {
    loadAnalytics()
    loadBillingReport()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await SuperAdminService.getSystemAnalytics()
      console.log('Analytics data loaded successfully:', data)
      setAnalytics(data as AnalyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBillingReport = async () => {
    try {
      const data = await SuperAdminService.getMonthlyBillingReport()
      console.log('Billing report loaded successfully:', data)
      setBillingReport(data)
    } catch (error) {
      console.error('Error loading billing report:', error)
    }
  }

  const formatRoleName = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getTrendIcon = (direction: 'up' | 'down') => {
    return direction === 'up'
      ? <TrendingUp className="w-4 h-4 text-green-600" />
      : <TrendingDown className="w-4 h-4 text-red-600" />
  }

  const billingColumns = [
    {
      key: 'university_name',
      header: 'University',
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    {
      key: 'sessions_created',
      header: 'Sessions',
      render: (value: number) => <span className="text-sm">{value}</span>
    },
    {
      key: 'responses_collected',
      header: 'Responses',
      render: (value: number) => <span className="text-sm">{value}</span>
    },
    {
      key: 'unique_active_teachers',
      header: 'Teachers',
      render: (value: number) => <span className="text-sm">{value}</span>
    },
    {
      key: 'total_usage_score',
      header: 'Usage Score',
      render: (value: number) => (
        <span className="text-sm font-semibold text-blue-600">
          {Math.round(value)}
        </span>
      )
    },
    {
      key: 'estimated_cost',
      header: 'Est. Cost',
      render: (value: number) => (
        <span className="text-sm font-bold text-green-600">
          ${value.toFixed(2)}
        </span>
      )
    }
  ]

  const universityColumns = [
    {
      key: 'university_name',
      header: 'University',
      render: (value: string) => <span className="font-medium text-sm">{value}</span>
    },
    {
      key: 'total_sessions',
      header: 'Sessions',
      render: (value: number) => <span className="text-sm">{value}</span>
    },
    {
      key: 'total_responses',
      header: 'Responses',
      render: (value: number) => <span className="text-sm">{value}</span>
    },
    {
      key: 'active_teachers',
      header: 'Teachers',
      render: (value: number) => <span className="text-sm">{value}</span>
    },
    {
      key: 'response_rate',
      header: 'Response Rate',
      render: (value: number) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ minWidth: '60px' }}>
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${Math.min(value || 0, 100)}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-600">{value?.toFixed(1) || 0}%</span>
        </div>
      )
    },
    {
      key: 'last_activity',
      header: 'Last Active',
      render: (value: string) => (
        <span className="text-xs text-gray-500">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      )
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const usersTrend = analytics.trends['Total Users']
  const sessionsTrend = analytics.trends['Active Sessions']
  const responsesTrend = analytics.trends['Total Responses']

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">System Analytics</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <button
              onClick={() => setShowBilling(!showBilling)}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <DollarSign className="w-4 h-4" />
              <span className="whitespace-nowrap">{showBilling ? 'Hide Billing' : 'Show Billing Report'}</span>
            </button>
            <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatsCard
          title="Total Universities"
          value={analytics.overview.total_universities}
          icon={<University className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Total Users"
          value={analytics.overview.total_users}
          icon={<Users className="w-6 h-6" />}
          color="green"
          trend={usersTrend ? {
            value: usersTrend.growth,
            label: `${usersTrend.growth > 0 ? '+' : ''}${usersTrend.growth}% vs last month`
          } : undefined}
        />
        <StatsCard
          title="Total Sessions"
          value={analytics.overview.total_sessions}
          icon={<BookOpen className="w-6 h-6" />}
          color="purple"
          trend={sessionsTrend ? {
            value: sessionsTrend.growth,
            label: `${sessionsTrend.growth > 0 ? '+' : ''}${sessionsTrend.growth}% vs last month`
          } : undefined}
        />
        <StatsCard
          title="Total Responses"
          value={analytics.overview.total_responses}
          icon={<MessageSquare className="w-6 h-6" />}
          color="red"
          trend={responsesTrend ? {
            value: responsesTrend.growth,
            label: `${responsesTrend.growth > 0 ? '+' : ''}${responsesTrend.growth}% vs last month`
          } : undefined}
        />
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <div className="text-center p-2 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">
              {analytics.overview.active_sessions_today}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Sessions Today</div>
          </div>
        </Card>
        <Card>
          <div className="text-center p-2 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {analytics.overview.responses_today}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Responses Today</div>
          </div>
        </Card>
        <Card>
          <div className="text-center p-2 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">
              {analytics.overview.overall_response_rate?.toFixed(1) || 0}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Overall Response Rate</div>
          </div>
        </Card>
      </div>

      {/* Billing Report */}
      {showBilling && (
        <Card title="Monthly Billing Report (Usage-Based)">
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Pricing Model:</h4>
            <div className="text-xs sm:text-sm text-blue-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>• $5.00 per session created</div>
              <div>• $0.10 per response collected</div>
              <div>• $2.00 per active teacher</div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Usage Score = (Sessions × 10) + (Responses × 1) + (Teachers × 5)
            </p>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table
                columns={billingColumns}
                data={billingReport}
                emptyMessage="No billing data available for this month"
              />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="font-semibold text-gray-700 text-sm sm:text-base">Total Estimated Revenue:</span>
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                ${billingReport.reduce((sum, item) => sum + (item.estimated_cost || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Users by Role */}
        <Card title="Users by Role">
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(analytics.usersByRole).length > 0 ? (
              Object.entries(analytics.usersByRole)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-2 sm:mr-3"></div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {formatRoleName(role)}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))
            ) : (
              <p className="text-sm text-gray-500">No user data available</p>
            )}
          </div>
        </Card>

        {/* Growth Trends */}
        <Card title="Growth Trends (This Month)">
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(analytics.trends).length > 0 ? (
              Object.entries(analytics.trends).map(([metric, data]) => (
                <div key={metric} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 last:border-b-0 gap-2">
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-gray-700">{metric}</div>
                    <div className="text-xs text-gray-500">
                      Current: {data.current} | Previous: {data.previous}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(data.direction)}
                    <span className={`text-xs sm:text-sm font-semibold ${
                      data.direction === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.growth > 0 ? '+' : ''}{data.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs sm:text-sm text-gray-500">No trend data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* University Activity */}
      <Card title="University Activity (Current Month)">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <Table
              columns={universityColumns}
              data={analytics.universityMetrics}
              emptyMessage="No university activity data available"
            />
          </div>
        </div>
      </Card>
      </div>
    </div>
  )
}
