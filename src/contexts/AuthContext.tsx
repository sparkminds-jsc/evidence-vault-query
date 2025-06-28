
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface Profile {
  id: string
  full_name: string
  role: 'admin' | 'staff'
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      console.log('Profile fetched:', data)
      return {
        ...data,
        role: data.role as 'admin' | 'staff'
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      return null
    }
  }

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener')
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id)
          console.log('Setting profile:', userProfile)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id)
        console.log('Setting initial profile:', userProfile)
        setProfile(userProfile)
      }
      
      setLoading(false)
    })

    return () => {
      console.log('AuthProvider: Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('SignIn called for:', email)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log('SignIn result:', error ? 'error' : 'success')
    return { error }
  }

  const signOut = async () => {
    console.log('SignOut called')
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
