import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../api/auth.api.js'
import { useAuthStore } from '../Store/authStore.js'
import Input from '../components/UI/Input.jsx'
import Button from '../components/UI/Button.jsx'
import logo from '../assets/images/logo.png'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth  = useAuthStore((s) => s.setAuth)

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from || '/'

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setError('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await authApi.login(form)
      setAuth(data.data.user, data.data.accessToken)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="
      min-h-screen
      bg-gradient-to-br from-blue-50 via-white to-slate-50
      dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
      flex items-center justify-center p-4
    ">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 drop-shadow-md">
            <img src={logo} alt="SnapTrack" className="w-16 h-16 rounded-2xl object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Log in to your SnapTrack account
          </p>
        </div>

        {/* Card */}
        <div className="
          bg-white dark:bg-gray-800
          rounded-2xl
          border border-gray-200 dark:border-gray-700
          shadow-sm
          p-8
        ">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="
                flex items-center gap-2
                text-xs text-red-600 dark:text-red-400
                bg-red-50 dark:bg-red-900/20
                border border-red-200 dark:border-red-800
                px-3 py-2.5 rounded-lg
              ">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <Button variant="primary" disabled={loading}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                    Logging in...
                  </span>
                : 'Log in'
              }
            </Button>
          </form>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login