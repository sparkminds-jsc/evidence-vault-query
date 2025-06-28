
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  console.log('ProtectedRoute - loading:', loading, 'user:', !!user)

  if (loading) {
    console.log('ProtectedRoute - Still loading, showing loading screen')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Đang tải...</div>
      </div>
    )
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('ProtectedRoute - User authenticated, rendering children')
  return <>{children}</>
}

export default ProtectedRoute
