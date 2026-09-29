import { useAuth } from '../context/AuthContext'

function Header() {
  const { isAuthenticated } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#1D232D] bg-[#10141B] px-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-[#EDEFF3]">
          AI Incident Command Center
        </h2>

        <span className="hidden items-center gap-1.5 rounded-full border border-[#1D232D] px-2.5 py-1 font-mono text-xs text-[#8A92A6] md:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#F5A623]" />
          </span>
          live
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5A623] text-sm font-semibold text-[#0A0D12]">
          U
        </div>

        <div className="hidden sm:block">
          <p className="text-sm font-medium text-[#EDEFF3]">
            Authenticated User
          </p>

          <p className="text-xs text-[#525A69] font-mono">
            {isAuthenticated ? 'jwt session active' : 'not authenticated'}
          </p>
        </div>
      </div>
    </header>
  )
}

export default Header