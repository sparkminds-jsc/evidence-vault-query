
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface StaffMember {
  id: string
  full_name: string | null
  email: string | null
  status: string | null
  created_at: string
  email_confirmed_at?: string | null
}

interface AuthUser {
  id: string
  email: string
  email_confirmed_at: string | null
  created_at: string
}

export const useStaffManagement = () => {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newStaff, setNewStaff] = useState({
    email: '',
    fullName: '',
    password: ''
  })
  const [creatingStaff, setCreatingStaff] = useState(false)
  const { createStaff } = useAuth()
  const { toast } = useToast()

  const fetchStaff = async () => {
    try {
      console.log('Fetching staff members...')
      
      // First, let's check current user's role
      const { data: currentUser } = await supabase.auth.getUser()
      console.log('Current user:', currentUser.user?.email)
      
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.user?.id)
        .single()
      
      console.log('Current user role:', currentProfile?.role)
      
      if (profileError) {
        console.error('Error fetching current user profile:', profileError)
      }

      // Fetch staff profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff')
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('Error fetching staff profiles:', profilesError)
        toast({
          title: "Error",
          description: `Unable to fetch staff members: ${profilesError.message}`,
          variant: "destructive"
        })
        return
      }

      // Fetch auth users to get email confirmation status
      const { data: authData, error: usersError } = await supabase.auth.admin.listUsers()
      
      if (usersError) {
        console.error('Error fetching auth users:', usersError)
        // If we can't fetch auth data, just use profiles data
        console.log('Using profiles data only')
        setStaff(profilesData || [])
        return
      }

      const users = authData.users as AuthUser[]

      // Merge profiles with auth data to get email confirmation status
      const staffWithAuthStatus = profilesData?.map(profile => {
        const authUser = users.find(user => user.id === profile.id)
        const isEmailConfirmed = authUser?.email_confirmed_at !== null
        
        return {
          ...profile,
          email_confirmed_at: authUser?.email_confirmed_at || null,
          status: isEmailConfirmed ? 'active' : 'unverified'
        }
      }) || []

      console.log('Merged staff data with auth status:', staffWithAuthStatus)
      setStaff(staffWithAuthStatus)
    } catch (error) {
      console.error('Unexpected error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingStaff(true)

    try {
      console.log('Creating staff member:', newStaff.email)
      console.log('Full staff data:', newStaff)
      
      // Check if user already exists in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.error('Error fetching auth users:', authError)
        console.log('Cannot check existing users, proceeding with normal creation flow...')
        // Fall back to normal creation flow
        const { error } = await createStaff(newStaff.email, newStaff.password, newStaff.fullName)
        
        if (error) {
          console.error('Error creating staff:', error)
          toast({
            title: "Error", 
            description: error.message || "Unable to create staff account",
            variant: "destructive"
          })
        } else {
          console.log('Staff created successfully')
          toast({
            title: "Success",
            description: "Staff member created successfully",
          })
          setCreateDialogOpen(false)
          setNewStaff({ email: '', fullName: '', password: '' })
          setTimeout(() => fetchStaff(), 2000)
        }
        return
      }
      
      const users = authData.users as AuthUser[]
      console.log('Found existing users:', users.length)
      const existingUser = users.find(user => user.email === newStaff.email)
      
      if (existingUser) {
        console.log('User already exists in auth, checking profiles...')
        
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', existingUser.id)
          .maybeSingle()
        
        if (!existingProfile) {
          console.log('Profile missing, creating profile for existing user...')
          console.log('Existing user data:', existingUser)
          console.log('Profile data to insert:', {
            id: existingUser.id,
            full_name: newStaff.fullName,
            email: newStaff.email,
            role: 'staff'
          })
          
          // Create profile for existing user
          const { data: insertedProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: existingUser.id,
              full_name: newStaff.fullName,
              email: newStaff.email,
              role: 'staff'
            })
            .select()
          
          if (profileError) {
            console.error('Error creating profile:', profileError)
            toast({
              title: "Error",
              description: `Unable to create staff profile: ${profileError.message}`,
              variant: "destructive"
            })
            return
          }
          
          console.log('Profile created successfully:', insertedProfile)
          toast({
            title: "Success",
            description: "Staff member created successfully",
          })
          setCreateDialogOpen(false)
          setNewStaff({ email: '', fullName: '', password: '' })
          setTimeout(() => fetchStaff(), 1000)
          return
        } else {
          toast({
            title: "Error",
            description: "Staff member with this email already exists",
            variant: "destructive"
          })
          return
        }
      }
      
      // Create new staff if user doesn't exist
      const { error } = await createStaff(newStaff.email, newStaff.password, newStaff.fullName)

      if (error) {
        console.error('Error creating staff:', error)
        toast({
          title: "Error",
          description: error.message || "Unable to create staff account",
          variant: "destructive"
        })
      } else {
        console.log('Staff created successfully')
        toast({
          title: "Success",
          description: "Staff member created successfully",
        })
        setCreateDialogOpen(false)
        setNewStaff({ email: '', fullName: '', password: '' })
        
        // Wait a bit longer and then fetch fresh data
        console.log('Waiting before refetch...')
        setTimeout(async () => {
          console.log('Refetching staff after creation...')
          await fetchStaff()
        }, 2000) // Increase delay to 2 seconds
      }
    } catch (error) {
      console.error('Unexpected error creating staff:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setCreatingStaff(false)
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member? This will completely remove them from the system.')) {
      return
    }

    try {
      console.log('Deleting staff member:', staffId)
      
      // First delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', staffId)

      if (profileError) {
        console.error('Error deleting staff profile:', profileError)
        toast({
          title: "Error",
          description: "Unable to delete staff profile",
          variant: "destructive"
        })
        return
      }
      
      // Then delete from auth.users (requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(staffId)
      
      if (authError) {
        console.error('Error deleting auth user:', authError)
        // Even if auth deletion fails, we still removed the profile
        toast({
          title: "Warning",
          description: "Staff profile deleted, but auth user may still exist",
          variant: "destructive"
        })
      } else {
        console.log('Staff member completely deleted')
        toast({
          title: "Success",
          description: "Staff member deleted successfully"
        })
      }
      
      fetchStaff()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  return {
    staff,
    loading,
    createDialogOpen,
    setCreateDialogOpen,
    newStaff,
    setNewStaff,
    creatingStaff,
    handleCreateStaff,
    handleDeleteStaff,
    fetchStaff
  }
}
