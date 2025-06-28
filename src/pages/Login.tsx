
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user, profile } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    console.log('Auth state changed:', { user: !!user, profile })
    if (user && profile) {
      console.log('User profile:', profile)
      if (profile.role === 'admin') {
        console.log('Navigating to manage-staff')
        navigate('/manage-staff', { replace: true })
      } else {
        console.log('Navigating to home')
        navigate('/', { replace: true })
      }
    }
  }, [user, profile, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Attempting to sign in with:', email)
      const { error } = await signIn(email, password)

      if (error) {
        console.error('Sign in error:', error)
        toast({
          title: "Lỗi đăng nhập",
          description: error.message || "Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.",
          variant: "destructive"
        })
        setLoading(false)
      } else {
        console.log('Sign in successful, waiting for auth state change...')
        // Don't set loading to false here - let the useEffect handle navigation
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email và mật khẩu để truy cập hệ thống
          </CardDescription>
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
                required
                placeholder="Nhập email của bạn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Nhập mật khẩu"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
