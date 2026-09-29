import api from './api'

const authService = {
  register: async (email, password) => {
    const response = await api.post('/api/auth/register', {
      email,
      password,
    })

    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    })

    return response.data
  },
}

export default authService