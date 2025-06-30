
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching staff:', error)
        toast({
          title: "Error",
          description: "Unable to fetch staff members",
          variant: "destructive"
        })
        return
      }

      console.log('Fetched staff data:', data)
      setStaff(data || [])
    } catch (error) {
      console.error('Error:', error)
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
        
        // Force a fresh fetch without relying on setTimeout
        await fetchStaff()
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
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', staffId)

      if (error) {
        console.error('Error deleting staff:', error)
        toast({
          title: "Error",
          description: "Unable to delete staff member",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: "Staff member deleted successfully"
        })
        fetchStaff()
      }
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
