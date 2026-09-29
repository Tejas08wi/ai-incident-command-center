import api from './api'

const aiService = {
  analyzeIncident: async (incidentId) => {
    const response = await api.get(
      `/api/ai/analyze/${incidentId}`
    )

    return response.data
  },
}

export default aiService