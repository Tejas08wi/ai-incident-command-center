import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Sidebar() {
  const { logout } = useAuth()

  const linkClass = ({ isActive }) =>
    `block border-l-2 px-4 py-3 text-sm font-medium transition ${
      isActive
        ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
        : 'border-transparent text-[#8A92A6] hover:bg-[#161B24] hover:text-[#EDEFF3]'
    }`

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[#1D232D] bg-[#0A0D12]">
      <div className="border-b border-[#1D232D] px-6 py-5">
        <h1 className="text-lg font-semibold text-[#EDEFF3]">
          Incident Command
        </h1>

        <p className="mt-1 font-mono text-xs text-[#525A69]">
          AI Operations Center
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-0 py-6">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/incidents" className={linkClass}>
          Incidents
        </NavLink>
      </nav>

      <div className="border-t border-[#1D232D] p-4">
        <button
          onClick={logout}
          className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-[#8A92A6] transition hover:bg-red-950/40 hover:text-red-400"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar