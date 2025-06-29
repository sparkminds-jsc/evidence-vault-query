
import React, { useState } from 'react'
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
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== LOGIN ATTEMPT STARTED ===')
    console.log('Email:', email)
    console.log('Password length:', password.length)
    
    setLoading(true)

    try {
      console.log('Attempting to sign in with:', email)
      const result = await signIn(email, password)
      console.log('Sign in result:', result)

      if (result.error) {
        console.error('Sign in error details:', {
          message: result.error.message,
          status: result.error.status,
          statusText: result.error.statusText
        })
        toast({
          title: "Login Error", 
          description: result.error.message || "Unable to log in. Please check your information.",
          variant: "destructive"
        })
        setLoading(false)
      } else {
        console.log('Sign in successful! Navigating immediately...')
        
        // Navigate immediately after successful login
        if (email === 'admin@suppliedshield.com') {
          console.log('Admin email detected, navigating to /manage-staff')
          navigate('/manage-staff', { replace: true })
        } else {
          console.log('Regular user, navigating to /')
          navigate('/', { replace: true })
        }
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        })
        
        setLoading(false)
        console.log('Navigation completed')
      }
    } catch (error) {
      console.error('Unexpected error during login:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
      setLoading(false)
    }
    
    console.log('=== LOGIN ATTEMPT FINISHED ===')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your email and password to access the system
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
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
