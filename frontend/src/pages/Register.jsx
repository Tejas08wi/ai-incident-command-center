import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      await register(email, password)
      navigate('/login')
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const timeStr = now.toLocaleTimeString('en-US', { hour12: false })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="min-h-screen bg-[#0A0D12] text-[#EDEFF3] flex">

      {/* Left panel — command center identity */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-r border-[#1D232D] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#F5A623 1px, transparent 1px), linear-gradient(90deg, #F5A623 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative flex items-center gap-2 font-mono text-xs text-[#8A92A6]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F5A623]" />
          </span>
          all systems operational
        </div>

        <div className="relative">
          <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight max-w-md">
            AI Incident Command Center
          </h1>
          <p className="mt-4 text-[#8A92A6] max-w-sm leading-relaxed">
            Provision an account and get access to detection, triage, and response in one console.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 max-w-sm font-mono">
            <div>
              <div className="text-2xl text-[#F5A623]">99.98%</div>
              <div className="text-xs text-[#8A92A6] mt-1">uptime</div>
            </div>
            <div>
              <div className="text-2xl">0</div>
              <div className="text-xs text-[#8A92A6] mt-1">active incidents</div>
            </div>
            <div>
              <div className="text-2xl">4m</div>
              <div className="text-xs text-[#8A92A6] mt-1">avg response</div>
            </div>
          </div>
        </div>

        <div className="relative flex items-baseline justify-between font-mono text-sm text-[#8A92A6]">
          <span>{dateStr}</span>
          <span className="text-[#EDEFF3] tabular-nums">{timeStr}</span>
        </div>
      </div>

      {/* Right panel — create account */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <h1 className="text-2xl font-semibold">AI Incident Command Center</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold">Create your account</h2>
            <p className="mt-1.5 text-sm text-[#8A92A6]">Set up access to the console.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#C4C9D4]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-lg border border-[#1D232D] bg-[#10141B] px-4 py-3 text-[#EDEFF3] placeholder-[#525A69] outline-none transition-colors focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-[#C4C9D4]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs text-[#8A92A6] hover:text-[#F5A623] transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-[#1D232D] bg-[#10141B] px-4 py-3 text-[#EDEFF3] placeholder-[#525A69] outline-none transition-colors focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                placeholder="Create a password"
              />
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#F5A623] px-4 py-3 font-medium text-[#0A0D12] transition hover:bg-[#FFB84D] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="h-4 w-4 rounded-full border-2 border-[#0A0D12]/30 border-t-[#0A0D12] animate-spin" />
              )}
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="mt-6 text-center text-sm text-[#8A92A6]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#F5A623] hover:text-[#FFB84D]">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register