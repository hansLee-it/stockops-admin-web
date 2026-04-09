/**
 * Main layout component with sidebar navigation.
 * Provides consistent layout structure for authenticated pages.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, MapPin, LogOut, Clock } from 'lucide-react'

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
 * Main layout with sidebar navigation and content area.
 * Uses React Router Outlet for nested routes.
 *
 * @returns Layout JSX element with sidebar and content area
 */
export function MainLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-neutral-900 text-white flex flex-col">
        <div className="p-4 border-b border-neutral-700">
          <h1 className="text-xl font-bold">StockOps</h1>
          <p className="text-sm text-neutral-400">{user?.email}</p>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
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
      <main className="flex-1 p-8 bg-neutral-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}