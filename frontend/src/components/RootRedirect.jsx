import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RootRedirect() {
  const { isAuthenticated } = useAuth()

  return (
    <Navigate
      to={isAuthenticated ? '/dashboard' : '/login'}
      replace
    />
  )
}

export default RootRedirect