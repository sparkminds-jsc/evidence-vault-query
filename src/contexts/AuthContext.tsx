
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  status: string | null
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  createStaff: (email: string, password: string, fullName: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    console.log('=== AUTH CONTEXT INITIALIZATION ===')
    
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check - session exists:', !!session)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false) // Set loading false here
    })

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event)
        console.log('Session exists:', !!session)
        console.log('User exists:', !!session?.user)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // Don't fetch profile - simplified logic as requested
        if (session?.user) {
          console.log('User logged in:', session.user.email)
        } else {
          console.log('No user, clearing state')
          setProfile(null)
        }
        
        // Always set loading to false after processing auth state change
        setLoading(false)
      }
    )

    return () => {
      console.log('Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('=== SIGNIN FUNCTION CALLED ===')
      console.log('Attempting signInWithPassword for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('signInWithPassword result:')
      console.log('- Error:', error)
      console.log('- Data exists:', !!data)
      console.log('- User exists:', !!data?.user)
      console.log('- Session exists:', !!data?.session)
      
      if (data?.user) {
        console.log('User details:', {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at
        })
      }
      
      return { error }
    } catch (error) {
      console.error('Exception in signIn function:', error)
      return { error }
    }
  }

  const signOut = async () => {
    console.log('Signing out user')
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const createStaff = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Creating staff account for:', email)
      
      // Store current session to restore it later
      const currentSession = session
      
      // Create staff account by directly inserting into auth.users via admin functions
      // Since we can't use admin functions from frontend, we'll use a workaround
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'staff'
          }
        }
      })

      if (error) {
        console.error('Error creating staff:', error)
        return { error }
      }

      // Immediately restore the admin session after creating the staff
      if (currentSession && data.user) {
        console.log('Restoring admin session after staff creation')
        
        // Sign out the newly created staff user
        await supabase.auth.signOut()
        
        // Restore the admin session by signing them back in
        if (currentSession.user?.email) {
          // We need to set the session back manually since we can't easily restore it
          // The auth state change listener will handle updating the context
          setSession(currentSession)
          setUser(currentSession.user)
        }
      }

      console.log('Staff account created successfully')
      toast({
        title: "Thành công!",
        description: "Tạo tài khoản nhân viên thành công",
      })

      return { error: null }
    } catch (error) {
      console.error('Exception while creating staff:', error)
      return { error }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signOut,
    createStaff
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
