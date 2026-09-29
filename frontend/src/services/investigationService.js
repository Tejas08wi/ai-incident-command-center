import axios from 'axios'

const investigationApi = axios.create({
  baseURL: 'http://localhost:8081',
})

investigationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

const investigationService = {
  getInvestigationsByIncident: async (incidentId) => {
    const response = await investigationApi.get(
      `/api/investigations/incident/${incidentId}`
    )

    return response.data
  },

  getInvestigationEvidence: async (investigationId) => {
    const response = await investigationApi.get(
      `/api/investigations/${investigationId}/evidence`
    )

    return response.data
  },

  getAuditLogs: async (investigationId) => {
    const response = await investigationApi.get(
      `/api/investigations/${investigationId}/audit-logs`
    )

    return response.data
  },
}

export default investigationService