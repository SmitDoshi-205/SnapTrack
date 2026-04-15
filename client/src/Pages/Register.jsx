import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth.api.js'
import { useAuthStore } from '../Store/authStore.js'
import Input from '../components/UI/Input.jsx'
import Button from '../components/UI/Button.jsx'

function Register() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)

  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

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
      const { data } = await authApi.register(form)
      setAuth(data.data.user, data.data.accessToken)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="
      min-h-screen
      bg-gradient-to-br from-blue-50 via-white to-gray-50
      dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
      flex items-center justify-center p-4
    ">
      <div className="w-full max-w-sm">

        {/* Logo block */}
        <div className="flex flex-col items-center mb-8">
          <div className="
            w-12 h-12 bg-blue-600 rounded-2xl
            flex items-center justify-center
            shadow-lg shadow-blue-200 dark:shadow-blue-900/40
            mb-4
          ">
            <span className="text-white text-lg font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create an account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Start managing your projects with SnapTrack
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
              label="Full name"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Name"
              required
            />
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
              placeholder="Min. 8 characters"
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
                    Creating account...
                  </span>
                : 'Create account'
              }
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register