import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import incidentService from '../services/incidentService'
import investigationService from '../services/investigationService'

function Dashboard() {
  const [incidents, setIncidents] = useState([])
  const [investigationCount, setInvestigationCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const incidentData =
          await incidentService.getAllIncidents()

        setIncidents(incidentData)

        // Load investigation history for each incident
        const investigationResults =
          await Promise.all(
            incidentData.map((incident) =>
              investigationService
                .getInvestigationsByIncident(
                  incident.id
                )
                .catch(() => [])
            )
          )

        const totalInvestigations =
          investigationResults.reduce(
            (total, investigations) =>
              total + investigations.length,
            0
          )

        setInvestigationCount(
          totalInvestigations
        )
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.response?.data?.detail ||
            'Failed to load dashboard data.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // =========================
  // Dashboard Metrics
  // =========================

  const openIncidents =
    incidents.filter(
      (incident) =>
        incident.status?.toUpperCase() === 'OPEN'
    ).length

  const totalIncidents = incidents.length

  const services = new Set(
    incidents
      .map((incident) => incident.serviceName)
      .filter(Boolean)
  )

  const recentIncidents = [...incidents]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 5)

  const severityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return '#EF4444'
      case 'HIGH':
        return '#F5A623'
      case 'MEDIUM':
        return '#EAB308'
      default:
        return '#3A4150'
    }
  }

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#EDEFF3]">
            Dashboard
          </h1>

          <p className="mt-2 text-[#8A92A6]">
            Monitor incidents and investigate production
            issues with AI-assisted analysis.
          </p>
        </div>

        <div className="rounded-xl border border-[#1D232D] bg-[#10141B] p-6 flex items-center gap-3">
          <span className="h-4 w-4 rounded-full border-2 border-[#F5A623]/30 border-t-[#F5A623] animate-spin" />
          <p className="text-sm text-[#8A92A6] font-mono">
            loading dashboard…
          </p>
        </div>
      </div>
    )
  }

  // =========================
  // Error
  // =========================

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#EDEFF3]">
            Dashboard
          </h1>

          <p className="mt-2 text-[#8A92A6]">
            Monitor incidents and investigate production
            issues with AI-assisted analysis.
          </p>
        </div>

        <div className="rounded-xl border border-red-900 bg-red-950/40 p-6">
          <p className="text-sm text-red-300">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>

      {/* =========================
          Header
      ========================= */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#EDEFF3]">
            Dashboard
          </h1>

          <p className="mt-2 text-[#8A92A6]">
            Monitor incidents and investigate production
            issues with AI-assisted analysis.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 font-mono text-xs text-[#8A92A6]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F5A623]" />
          </span>
          live
        </div>
      </div>

      {/* =========================
          Metrics — unified readout strip
      ========================= */}

      <div className="rounded-xl border border-[#1D232D] bg-[#10141B] divide-y divide-[#1D232D] md:divide-y-0 md:divide-x md:grid md:grid-cols-4">

        <div className="p-6">
          <p className="text-xs font-mono uppercase tracking-wider text-[#525A69]">
            Open
          </p>
          <p className="mt-2 font-mono text-4xl text-[#F5A623] tabular-nums">
            {String(openIncidents).padStart(2, '0')}
          </p>
          <p className="mt-1 text-xs text-[#8A92A6]">
            incidents currently open
          </p>
        </div>

        <div className="p-6">
          <p className="text-xs font-mono uppercase tracking-wider text-[#525A69]">
            Total
          </p>
          <p className="mt-2 font-mono text-4xl text-[#EDEFF3] tabular-nums">
            {String(totalIncidents).padStart(2, '0')}
          </p>
          <p className="mt-1 text-xs text-[#8A92A6]">
            recorded all-time
          </p>
        </div>

        <div className="p-6">
          <p className="text-xs font-mono uppercase tracking-wider text-[#525A69]">
            Services
          </p>
          <p className="mt-2 font-mono text-4xl text-[#EDEFF3] tabular-nums">
            {String(services.size).padStart(2, '0')}
          </p>
          <p className="mt-1 text-xs text-[#8A92A6]">
            currently affected
          </p>
        </div>

        <div className="p-6">
          <p className="text-xs font-mono uppercase tracking-wider text-[#525A69]">
            Investigated
          </p>
          <p className="mt-2 font-mono text-4xl text-[#EDEFF3] tabular-nums">
            {String(investigationCount).padStart(2, '0')}
          </p>
          <p className="mt-1 text-xs text-[#8A92A6]">
            AI investigation runs
          </p>
        </div>

      </div>

      {/* =========================
          Recent Incidents — striped list
      ========================= */}

      <div className="mt-8">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-[#EDEFF3]">
              Recent Incidents
            </h2>

            <p className="mt-1 text-sm text-[#8A92A6]">
              Latest incidents recorded in the system.
            </p>
          </div>

          <Link
            to="/incidents"
            className="text-sm text-[#F5A623] transition hover:text-[#FFB84D]"
          >
            View all incidents →
          </Link>

        </div>

        {recentIncidents.length === 0 ? (
          <div className="mt-6 rounded-xl border border-[#1D232D] bg-[#10141B] p-8 text-center">
            <p className="text-sm text-[#8A92A6]">
              No incidents found.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-[#1D232D] bg-[#10141B] divide-y divide-[#1D232D] overflow-hidden">

            {recentIncidents.map((incident) => {

              const severity =
                incident.severity?.toUpperCase()

              const status =
                incident.status?.toUpperCase()

              return (
                <Link
                  key={incident.id}
                  to={`/incidents/${incident.id}`}
                  className="flex items-center gap-4 py-4 pr-5 transition hover:bg-[#161B24]"
                  style={{
                    borderLeft: `3px solid ${severityColor(severity)}`,
                    paddingLeft: '1.25rem',
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-[#525A69]">
                        #{incident.id}
                      </span>
                      <p className="truncate text-sm font-medium text-[#EDEFF3]">
                        {incident.title}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-xs text-[#525A69]">
                      {incident.description}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-sm text-[#8A92A6] sm:block w-32 truncate">
                    {incident.serviceName || '—'}
                  </div>

                  <div className="hidden shrink-0 font-mono text-xs uppercase w-20 sm:block" style={{ color: severityColor(severity) }}>
                    {severity || 'UNKNOWN'}
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 w-24">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        status === 'OPEN'
                          ? 'bg-[#F5A623]'
                          : status === 'CLOSED'
                            ? 'bg-green-400'
                            : 'bg-[#525A69]'
                      }`}
                    />
                    <span className="text-xs text-[#8A92A6]">
                      {status || 'UNKNOWN'}
                    </span>
                  </div>

                  <div className="hidden shrink-0 text-right font-mono text-xs text-[#525A69] lg:block w-36">
                    {incident.createdAt
                      ? new Date(incident.createdAt).toLocaleString()
                      : '—'}
                  </div>
                </Link>
              )
            })}

          </div>
        )}

      </div>

    </div>
  )
}

export default Dashboard