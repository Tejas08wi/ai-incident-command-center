import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootRedirect from './components/RootRedirect'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Incidents from './pages/Incidents'
import IncidentDetails from './pages/IncidentDetails'

import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<RootRedirect />} />
          
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/incidents" element={<Incidents />} />

            <Route
              path="/incidents/:id"
              element={<IncidentDetails />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App