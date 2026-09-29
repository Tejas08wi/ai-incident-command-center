import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import incidentService from '../services/incidentService'

function Incidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceName: '',
    severity: 'LOW',
    status: 'OPEN',
  })

  const loadIncidents = async () => {
    try {
      setError('')

      const data = await incidentService.getAllIncidents()

      setIncidents(data)
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Failed to load incidents.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncidents()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleCreateIncident = async (event) => {
    event.preventDefault()

    try {
      setCreating(true)
      setCreateError('')

      await incidentService.createIncident(formData)

      setFormData({
        title: '',
        description: '',
        serviceName: '',
        severity: 'LOW',
        status: 'OPEN',
      })

      setShowCreateForm(false)

      await loadIncidents()
    } catch (error) {
      setCreateError(
        error.response?.data?.message ||
        'Failed to create incident.'
      )
    } finally {
      setCreating(false)
    }
  }

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

  const inputClass =
    'w-full rounded-lg border border-[#1D232D] bg-[#0A0D12] px-4 py-3 text-[#EDEFF3] outline-none placeholder:text-[#525A69] transition-colors focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]'

  const labelClass = 'mb-2 block text-sm font-medium text-[#C4C9D4]'

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#EDEFF3]">
            Incidents
          </h1>

          <p className="mt-2 text-[#8A92A6]">
            View and investigate reported production incidents.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreateForm((previous) => !previous)
            setCreateError('')
          }}
          className="rounded-lg bg-[#F5A623] px-5 py-2.5 text-sm font-medium text-[#0A0D12] transition hover:bg-[#FFB84D]"
        >
          {showCreateForm
            ? 'Cancel'
            : '+ Create Incident'}
        </button>
      </div>

      {/* Create Incident Form */}
      {showCreateForm && (
        <div className="mb-8 rounded-xl border border-[#1D232D] bg-[#10141B] p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#EDEFF3]">
              Create Incident
            </h2>

            <p className="mt-1 text-sm text-[#8A92A6]">
              Report a production incident for investigation.
            </p>
          </div>

          {createError && (
            <div className="mb-6 rounded-lg border border-red-900 bg-red-950/40 p-4">
              <p className="text-sm text-red-300">
                {createError}
              </p>
            </div>
          )}

          <form
            onSubmit={handleCreateIncident}
            className="space-y-5"
          >
            {/* Title */}
            <div>
              <label htmlFor="title" className={labelClass}>
                Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Payment Service Failure"
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe what is happening..."
                className={`resize-none ${inputClass}`}
              />
            </div>

            {/* Service Name */}
            <div>
              <label htmlFor="serviceName" className={labelClass}>
                Service Name
              </label>

              <input
                id="serviceName"
                name="serviceName"
                type="text"
                value={formData.serviceName}
                onChange={handleChange}
                required
                placeholder="payment-service"
                className={inputClass}
              />
            </div>

            {/* Severity + Status */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="severity" className={labelClass}>
                  Severity
                </label>

                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className={labelClass}>
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">
                    IN_PROGRESS
                  </option>
                  <option value="RESOLVED">
                    RESOLVED
                  </option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-[#F5A623] px-6 py-3 text-sm font-medium text-[#0A0D12] transition hover:bg-[#FFB84D] disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
              >
                {creating && (
                  <span className="h-4 w-4 rounded-full border-2 border-[#0A0D12]/30 border-t-[#0A0D12] animate-spin" />
                )}
                {creating
                  ? 'Creating…'
                  : 'Create Incident'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-[#1D232D] bg-[#10141B] p-6 flex items-center gap-3">
          <span className="h-4 w-4 rounded-full border-2 border-[#F5A623]/30 border-t-[#F5A623] animate-spin" />
          <p className="text-sm text-[#8A92A6] font-mono">
            loading incidents…
          </p>
        </div>
      )}

      {/* Load Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-6">
          <p className="text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && incidents.length === 0 && (
        <div className="rounded-xl border border-[#1D232D] bg-[#10141B] p-10 text-center">
          <h2 className="text-lg font-semibold text-[#EDEFF3]">
            No incidents found
          </h2>

          <p className="mt-2 text-[#8A92A6]">
            There are currently no incidents in the system.
          </p>
        </div>
      )}

      {/* Incident List */}
      {!loading && !error && incidents.length > 0 && (
        <div className="rounded-xl border border-[#1D232D] bg-[#10141B] divide-y divide-[#1D232D] overflow-hidden">
          {incidents.map((incident) => (
            <Link
              key={incident.id}
              to={`/incidents/${incident.id}`}
              className="flex items-center gap-4 py-4 pr-5 transition hover:bg-[#161B24]"
              style={{
                borderLeft: `3px solid ${severityColor(incident.severity)}`,
                paddingLeft: '1.25rem',
              }}
            >
              <span className="font-mono text-xs text-[#525A69] w-12 shrink-0">
                #{incident.id}
              </span>

              <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#EDEFF3]">
                {incident.title}
              </p>

              <span className="hidden shrink-0 text-sm text-[#8A92A6] sm:block w-36 truncate">
                {incident.serviceName}
              </span>

              <span
                className="hidden shrink-0 font-mono text-xs uppercase w-20 sm:block"
                style={{ color: severityColor(incident.severity) }}
              >
                {incident.severity}
              </span>

              <span className="shrink-0 text-xs text-[#8A92A6] w-28">
                {incident.status}
              </span>

              <span className="hidden shrink-0 text-right font-mono text-xs text-[#525A69] lg:block w-36">
                {incident.createdAt
                  ? new Date(incident.createdAt).toLocaleString()
                  : '—'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Incidents