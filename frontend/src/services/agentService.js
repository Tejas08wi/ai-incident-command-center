import axios from 'axios'

const agentApi = axios.create({
  baseURL: 'http://localhost:8000',
})

agentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

const agentService = {
  startInvestigation: async (message, threadId) => {
    const response = await agentApi.post(
      '/api/agent/test',
      {
        message,
        thread_id: threadId,
      }
    )

    return response.data
  },

  resumeInvestigation: async (
    threadId,
    approval
  ) => {
    const response = await agentApi.post(
      `/api/agent/resume/${threadId}`,
      {
        approval,
      }
    )

    return response.data
  },

  getCheckpoint: async (threadId) => {
    const response = await agentApi.get(
      `/api/agent/checkpoint/${threadId}`
    )

    return response.data
  },
}

export default agentService