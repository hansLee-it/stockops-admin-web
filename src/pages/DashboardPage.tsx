/**
 * Dashboard page component.
 * Main landing page after login showing system overview.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useAuthStore } from '@/stores/authStore'
import { useDashboardSummary, useDashboardTransactions } from '@/hooks/useDashboard'
import { Link } from 'react-router-dom'
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Clock, TrendingUp, AlertCircle } from 'lucide-react'

/**
 * Dashboard page displaying welcome message and system overview.
 * Shows key metrics, recent transactions, and quick actions.
 *
 * @returns Dashboard page JSX element
 */
export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: transactions, isLoading: transactionsLoading } = useDashboardTransactions(5)

  const isLoading = summaryLoading || transactionsLoading

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-neutral-900">Dashboard</h1>
      <p className="text-neutral-600 mb-6">
        Welcome back, <span className="font-medium">{user?.name || 'User'}</span>!
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          title="Total Products"
          value={summary?.totalProducts ?? 0}
          icon={<Package className="w-6 h-6" />}
          color="primary"
          loading={isLoading}
        />
        <DashboardCard
          title="Total Inventory"
          value={summary?.totalInventoryQuantity ?? 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="primary"
          loading={isLoading}
        />
        <DashboardCard
          title="Today's Inbound"
          value={summary?.todayInboundCount ?? 0}
          icon={<ArrowDownToLine className="w-6 h-6" />}
          color="success"
          loading={isLoading}
        />
        <DashboardCard
          title="Today's Outbound"
          value={summary?.todayOutboundCount ?? 0}
          icon={<ArrowUpFromLine className="w-6 h-6" />}
          color="info"
          loading={isLoading}
        />
        <DashboardCard
          title="Low Stock Items"
          value={summary?.lowStockCount ?? 0}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="warning"
          linkTo="/inventory?filter=low"
          loading={isLoading}
        />
        <DashboardCard
          title="Pending Cycle Counts"
          value={summary?.pendingCycleCounts ?? 0}
          icon={<Clock className="w-6 h-6" />}
          color="neutral"
          loading={isLoading}
        />
        <DashboardCard
          title="Critical Expiry Alerts"
          value={summary?.criticalExpiryCount ?? 0}
          icon={<AlertCircle className="w-6 h-6" />}
          color="error"
          linkTo="/expiry?level=critical"
          loading={isLoading}
        />
        <DashboardCard
          title="Warning Expiry Alerts"
          value={summary?.warningExpiryCount ?? 0}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="warning"
          loading={isLoading}
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4 text-neutral-900">Recent Transactions</h2>
        {isLoading ? (
          <div className="text-neutral-500">Loading transactions...</div>
        ) : transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-neutral-500">Type</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-neutral-500">Product</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-neutral-500">Location</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-neutral-500">Quantity</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-neutral-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-2 px-3">
                      <TransactionTypeBadge type={tx.type} />
                    </td>
                    <td className="py-2 px-3 text-neutral-900">{tx.productName}</td>
                    <td className="py-2 px-3 text-neutral-600">{tx.locationCode}</td>
                    <td className="py-2 px-3 text-right font-medium text-neutral-900">
                      {tx.type === 'OUTBOUND' ? '-' : '+'}{tx.quantity}
                    </td>
                    <td className="py-2 px-3 text-neutral-500 text-sm">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-neutral-500">No recent transactions</div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-neutral-900">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            to="/inbound"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            <ArrowDownToLine className="w-5 h-5" />
            Create Inbound
          </Link>
          <Link
            to="/outbound"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            <ArrowUpFromLine className="w-5 h-5" />
            Create Outbound
          </Link>
          <Link
            to="/inventory"
            className="flex items-center gap-2 px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <Package className="w-5 h-5" />
            View Inventory
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * Dashboard card component for displaying metrics.
 */
interface DashboardCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  linkTo?: string
  loading?: boolean
}

function DashboardCard({ title, value, icon, color, linkTo, loading }: DashboardCardProps) {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-50',
    success: 'text-success bg-green-50',
    warning: 'text-warning bg-amber-50',
    error: 'text-error bg-red-50',
    info: 'text-info bg-blue-50',
    neutral: 'text-neutral-600 bg-neutral-100',
  }

  const content = (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
        <div className={`p-2 rounded ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-8 bg-neutral-200 rounded animate-pulse" />
      ) : (
        <p className="text-3xl font-bold text-neutral-900">{value.toLocaleString()}</p>
      )}
    </div>
  )

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>
  }

  return content
}

/**
 * Transaction type badge component.
 */
function TransactionTypeBadge({ type }: { type: string }) {
  const badges = {
    INBOUND: { label: 'Inbound', className: 'bg-green-100 text-green-800' },
    OUTBOUND: { label: 'Outbound', className: 'bg-blue-100 text-blue-800' },
    ADJUSTMENT: { label: 'Adjustment', className: 'bg-amber-100 text-amber-800' },
  }

  const badge = badges[type as keyof typeof badges] || { label: type, className: 'bg-neutral-100 text-neutral-800' }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${badge.className}`}>
      {badge.label}
    </span>
  )
}