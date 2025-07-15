import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import CustomerFilters from '@/components/CustomerFilters'
import CustomerTable from '@/components/CustomerTable'
import CreateCustomerDialog from '@/components/CreateCustomerDialog'

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
  created_at: string
  updated_at: string
  created_by?: string
}

const ManageCustomer = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    email: '',
    fullName: ''
  })
  const [filters, setFilters] = useState({
    name: '',
    email: ''
  })
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const { signOut, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    // Filter customers based on search criteria
    const filtered = customers.filter(customer => {
      const nameMatch = filters.name === '' || 
        customer.full_name.toLowerCase().includes(filters.name.toLowerCase())
      return nameMatch
    })
    setFilteredCustomers(filtered)
  }, [customers, filters])

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers for current user...')
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching customers:', error)
        toast({
          title: "Error",
          description: "Could not load auditee list",
          variant: "destructive"
        })
        return
      }

      console.log('Fetched customers:', data?.length || 0)
      setCustomers(data || [])
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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingCustomer(true)

    try {
      if (!user?.id) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive"
        })
        return
      }

      // Generate auditee code from full name and check for uniqueness
      const baseCode = newCustomer.fullName.toUpperCase().replace(/\s+/g, '').substring(0, 6)
      let auditeeCode = baseCode
      let counter = 1

      // Check if code already exists
      while (true) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', auditeeCode)
          .single()

        if (!existingCustomer) {
          break
        }

        auditeeCode = `${baseCode}${counter}`
        counter++
      }

      const { error } = await supabase
        .from('customers')
        .insert({
          email: auditeeCode, // Using email field to store auditee code
          full_name: newCustomer.fullName,
          created_by: user.id
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: "Auditee code already exists in the system",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: error.message || "Could not create auditee",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Success",
          description: "Auditee created successfully"
        })
        setCreateDialogOpen(false)
        setNewCustomer({ email: '', fullName: '' })
        fetchCustomers()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setCreatingCustomer(false)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this auditee?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) {
        toast({
          title: "Error",
          description: "Could not delete auditee",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: "Auditee deleted successfully"
        })
        fetchCustomers()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  const handleUseToAudit = async (customerId: string) => {
    setUpdatingStatus(customerId)

    try {
      // First, set all customers to 'available' status
      const { error: resetError } = await supabase
        .from('customers')
        .update({ status: 'available' })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Update all rows

      if (resetError) {
        toast({
          title: "Error",
          description: "Could not update status",
          variant: "destructive"
        })
        return
      }

      // Then set the selected customer to 'in_use'
      const { error: updateError } = await supabase
        .from('customers')
        .update({ status: 'in_use' })
        .eq('id', customerId)

      if (updateError) {
        toast({
          title: "Error",
          description: "Could not update auditee status",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Success",
          description: "Auditee selected for audit"
        })
        fetchCustomers()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleSearch = () => {
    // The filtering is already handled by useEffect, so this is just for user experience
    toast({
      title: "Search",
      description: "Auditee list has been filtered"
    })
  }

  const getStatusText = (status: string) => {
    return status === 'in_use' ? 'In Use' : 'Available'
  }

  const getStatusColor = (status: string) => {
    return status === 'in_use' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
  }

  const handleBack = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Manage Auditee</h1>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        <CustomerFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          onCreateClick={() => setCreateDialogOpen(true)}
          createDialogOpen={createDialogOpen}
        >
          <CreateCustomerDialog
            newCustomer={newCustomer}
            onCustomerChange={setNewCustomer}
            onSubmit={handleCreateCustomer}
            onCancel={() => setCreateDialogOpen(false)}
            creatingCustomer={creatingCustomer}
          />
        </CustomerFilters>

        <CustomerTable
          filteredCustomers={filteredCustomers}
          customers={customers}
          onUseToAudit={handleUseToAudit}
          onDelete={handleDeleteCustomer}
          updatingStatus={updatingStatus}
          getStatusText={getStatusText}
          getStatusColor={getStatusColor}
        />
      </div>
    </div>
  )
}

export default ManageCustomer
