/**
 * Main application component with routing configuration.
 * Sets up React Router with protected routes and authentication flow.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MainLayout } from '@/components/MainLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'

/**
 * Main App component with route configuration.
 * - /login: Public login page
 * - /: Protected routes (requires authentication)
 * - /dashboard: Dashboard page (protected)
 * - /inventory: Inventory page (protected, placeholder)
 * - /inbound: Inbound page (protected, placeholder)
 * - /outbound: Outbound page (protected, placeholder)
 * - /locations: Locations page (protected, placeholder)
 *
 * @returns App JSX element with router configuration
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="inventory" element={<div className="text-neutral-900">Inventory Page</div>} />
          <Route path="inbound" element={<div className="text-neutral-900">Inbound Page</div>} />
          <Route path="outbound" element={<div className="text-neutral-900">Outbound Page</div>} />
          <Route path="locations" element={<div className="text-neutral-900">Locations Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App