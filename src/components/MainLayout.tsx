/**
 * Main layout component with sidebar navigation.
 * Enhanced with dark sidebar, warehouse selector, and notification bell.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { 
  LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, 
  MapPin, LogOut, Clock, Bell, Settings,
  Building2, Warehouse
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { to: '/centers', label: '센터 관리', icon: Building2 },
  { to: '/warehouses', label: '창고 관리', icon: Warehouse },
  { to: '/inventory', label: '재고 관리', icon: Package },
  { to: '/inbound', label: '입고 관리', icon: ArrowDownToLine },
  { to: '/outbound', label: '출고 관리', icon: ArrowUpFromLine },
  { to: '/locations', label: '위치 관리', icon: MapPin },
  { to: '/purchase-orders', label: '발주 관리', icon: Package },
  { to: '/expiry', label: '유통기한', icon: Clock },
  { to: '/settings', label: '설정', icon: Settings },
]

export function MainLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getPageTitle = () => {
    const item = navItems.find(item => item.to === location.pathname)
    return item?.label || 'StockOps'
  }

  return (
    <div className="min-h-screen flex bg-bg-secondary">
      <aside className="w-64 bg-bg-dark text-white flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">📦 StockOps</h1>
          </div>
          
          <div className="mt-4 space-y-2">
            <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm">
              <option value="">센터 선택</option>
              <option value="1">🏢 강남센터</option>
              <option value="2">🏢 서초센터</option>
            </select>
            <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm">
              <option value="">창고 선택</option>
              <option value="1">📦 강남 1창고</option>
              <option value="2">📦 강남 2창고</option>
            </select>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
                  isActive 
                    ? 'bg-primary-600 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-white/70 mb-3">
            <span>{user?.email || 'admin@stockops.com'}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 rounded hover:bg-white/10 w-full text-white/70"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-text-primary">
              {getPageTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-neutral-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-neutral-100 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
