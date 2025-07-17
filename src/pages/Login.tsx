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
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: 'url(/lovable-uploads/c351e656-8739-4aae-a21e-0fa5cea297fe.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Logo and Brand */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center">
        <img 
          src="/lovable-uploads/6d5b1c40-17c8-4c25-92c0-80d04fec2457.png" 
          alt="Supplier Shield Logo" 
          className="h-24 mx-auto"
        />
      </div>

      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-800">Sign in</CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
                className="h-12 border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="h-12 border-gray-200 focus:border-blue-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium mt-6" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
