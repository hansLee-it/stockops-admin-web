/**
 * Main layout component with sidebar navigation.
 * Provides consistent layout structure for authenticated pages.
 * Features collapsible sidebar with hamburger menu for mobile responsiveness.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, MapPin, LogOut, Clock, Menu, X } from 'lucide-react'

/**
 * Navigation item configuration.
 */
interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

/**
 * Navigation menu items.
 */
const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/inbound', label: 'Inbound', icon: ArrowDownToLine },
  { to: '/outbound', label: 'Outbound', icon: ArrowUpFromLine },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/expiry', label: 'Expiry', icon: Clock },
]

/**
 * Main layout with collapsible sidebar navigation and content area.
 * Uses React Router Outlet for nested routes.
 * Features hamburger menu toggle for mobile responsiveness.
 *
 * @returns Layout JSX element with collapsible sidebar and content area
 */
export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with close button (mobile) */}
        <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">StockOps</h1>
            <p className="text-sm text-neutral-400">{user?.email}</p>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 hover:bg-neutral-800 rounded transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeSidebar}
                className={`flex items-center gap-3 p-3 rounded mb-1 transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'hover:bg-neutral-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-neutral-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded hover:bg-neutral-800 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Mobile header with hamburger menu */}
        <header className="lg:hidden bg-white border-b border-neutral-200 p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-neutral-100 rounded transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">StockOps</h1>
        </header>

        {/* Content area */}
        <div className="flex-1 p-8 bg-neutral-50 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}