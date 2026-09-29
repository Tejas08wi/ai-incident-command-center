import api from './api'

const incidentService = {
  getAllIncidents: async () => {
    const response = await api.get('/api/incidents')
    return response.data
  },

  getIncidentById: async (id) => {
    const response = await api.get(`/api/incidents/${id}`)
    return response.data
  },

  createIncident: async (incident) => {
    const response = await api.post('/api/incidents', incident)
    return response.data
  },

  deleteIncident: async (id) => {
    await api.delete(`/api/incidents/${id}`)
  },
}

export default incidentService