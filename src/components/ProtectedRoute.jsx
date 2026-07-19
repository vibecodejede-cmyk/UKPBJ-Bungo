import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAdminSession } from '../lib/session'

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getAdminSession()

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true, state: { from: location } })
    }
  }, [session, navigate, location])

  if (!session) {
    return null
  }

  return children
}
