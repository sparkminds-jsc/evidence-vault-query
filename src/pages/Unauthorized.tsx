
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const Unauthorized = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">Không có quyền truy cập</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Bạn không có quyền truy cập vào trang này.
          </p>
          <Button onClick={handleLogout} className="w-full">
            Đăng xuất
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Unauthorized
