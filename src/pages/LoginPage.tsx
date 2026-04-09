/**
 * Login page component for StockOps authentication.
 * Provides email/password login form with JWT authentication.
 *
 * @author StockOps Team
 * @since 1.0
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'

/**
 * Login page with email/password authentication.
 * On successful login, stores JWT token and redirects to dashboard.
 *
 * @returns Login page JSX element
 */
export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('=== Login Debug Start ===')
      console.log('Sending login request with:', { email })
      
      const response = await api.post('/api/v1/auth/login', { email, password })
      
      console.log('API Response:', response)
      console.log('Response data:', response.data)
      console.log('Response data keys:', Object.keys(response.data))
      
      const { accessToken } = response.data
      console.log('Extracted accessToken:', accessToken ? 'Token exists (length: ' + accessToken.length + ')' : 'Token is NULL/UNDEFINED')
      
      if (!accessToken) {
        throw new Error('No accessToken in response')
      }
      
      const userData = { id: 1, email, name: email.split('@')[0], role: 'USER' }
      console.log('User data to store:', userData)
      
      console.log('Calling login function...')
      login(accessToken, userData)
      console.log('Login function called')
      
      // Verify store state
      const storeState = JSON.parse(localStorage.getItem('auth-storage') || '{}')
      console.log('Store state after login:', storeState)
      console.log('Token in storage:', storeState.state?.token ? 'EXISTS' : 'NULL')
      console.log('User in storage:', storeState.state?.user ? 'EXISTS' : 'NULL')
      
      console.log('=== Login Debug End ===')
      
      navigate('/dashboard')
    } catch (err: unknown) {
      console.error('Login error:', err)
      let message = 'Login failed'
      if (err && typeof err === 'object') {
        if ('response' in err && err.response && typeof err.response === 'object') {
          const response = err.response as { data?: { message?: string }; status?: number }
          if ('data' in response && response.data && typeof response.data === 'object') {
            if ('message' in response.data && response.data.message) {
              message = response.data.message
            } else {
              message = `Server error: ${response.status}`
            }
          }
        } else if ('message' in err && typeof (err as Error).message === 'string') {
          message = (err as Error).message
        }
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-neutral-900">StockOps</h1>
        {error && <div className="bg-error/10 text-error p-3 rounded mb-4">{error}</div>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-neutral-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1 text-neutral-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white p-2 rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
