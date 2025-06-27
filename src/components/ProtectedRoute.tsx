
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'staff'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
