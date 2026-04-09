/**
 * Dashboard page component.
 * Main landing page after login showing system overview.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useAuthStore } from '@/stores/authStore'

/**
 * Dashboard page displaying welcome message and system overview.
 * Shows basic information about the inventory management system.
 *
 * @returns Dashboard page JSX element
 */
export function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-neutral-900">Dashboard</h1>
      <p className="text-neutral-600 mb-6">
        Welcome back, <span className="font-medium">{user?.name || 'User'}</span>!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-neutral-500 mb-1">Total Products</h2>
          <p className="text-3xl font-bold text-neutral-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-neutral-500 mb-1">Total Inventory</h2>
          <p className="text-3xl font-bold text-neutral-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-neutral-500 mb-1">Expiring Soon</h2>
          <p className="text-3xl font-bold text-warning">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-neutral-500 mb-1">Expired</h2>
          <p className="text-3xl font-bold text-error">0</p>
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-neutral-900">Quick Actions</h2>
        <p className="text-neutral-600">
          StockOps inventory management system is ready. Use the navigation menu to access different features.
        </p>
      </div>
    </div>
  )
}