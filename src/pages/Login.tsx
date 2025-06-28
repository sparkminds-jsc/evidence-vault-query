
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, profile, user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    console.log('Login useEffect - user:', user, 'profile:', profile, 'authLoading:', authLoading)
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading, waiting...')
      return
    }
    
    if (user && profile) {
      console.log('Redirecting user with role:', profile.role)
      if (profile.role === 'admin') {
        console.log('Navigating to /manage-staff')
        navigate('/manage-staff', { replace: true })
      } else if (profile.role === 'staff') {
        console.log('Navigating to /manage-users')
        navigate('/manage-users', { replace: true })
      } else {
        console.log('Navigating to /')
        navigate('/', { replace: true })
      }
    } else if (user && !profile) {
      console.log('User exists but no profile, waiting for profile to load...')
    }
  }, [user, profile, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log('Login attempt for:', email)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('Login error:', error)
        toast({
          title: "Lỗi đăng nhập",
          description: error.message,
          variant: "destructive"
        })
        setLoading(false)
      } else {
        console.log('Login successful, waiting for redirect...')
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn quay lại!"
        })
        // Don't set loading to false here, let the redirect handle it
      }
    } catch (error) {
      console.error('Login catch error:', error)
      toast({
        title: "Lỗi đăng nhập",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SupplierShield</CardTitle>
          <CardDescription>Đăng nhập vào hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
