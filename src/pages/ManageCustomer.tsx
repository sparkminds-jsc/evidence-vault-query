
import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
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
  const { signOut } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    // Filter customers based on search criteria
    const filtered = customers.filter(customer => {
      const nameMatch = filters.name === '' || 
        customer.full_name.toLowerCase().includes(filters.name.toLowerCase())
      const emailMatch = filters.email === '' || 
        customer.email.toLowerCase().includes(filters.email.toLowerCase())
      return nameMatch && emailMatch
    })
    setFilteredCustomers(filtered)
  }, [customers, filters])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching customers:', error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách khách hàng",
          variant: "destructive"
        })
        return
      }

      setCustomers(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
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
      const { error } = await supabase
        .from('customers')
        .insert({
          email: newCustomer.email,
          full_name: newCustomer.fullName
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Lỗi",
            description: "Email đã tồn tại trong hệ thống",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Lỗi",
            description: error.message || "Không thể tạo khách hàng",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Thành công",
          description: "Tạo khách hàng thành công"
        })
        setCreateDialogOpen(false)
        setNewCustomer({ email: '', fullName: '' })
        fetchCustomers()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
        variant: "destructive"
      })
    } finally {
      setCreatingCustomer(false)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) {
        toast({
          title: "Lỗi",
          description: "Không thể xóa khách hàng",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Thành công",
          description: "Đã xóa khách hàng thành công"
        })
        fetchCustomers()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
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
          title: "Lỗi",
          description: "Không thể cập nhật trạng thái",
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
          title: "Lỗi",
          description: "Không thể cập nhật trạng thái khách hàng",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Thành công",
          description: "Đã chọn khách hàng để audit"
        })
        fetchCustomers()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
        variant: "destructive"
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleSearch = () => {
    // The filtering is already handled by useEffect, so this is just for user experience
    toast({
      title: "Tìm kiếm",
      description: "Danh sách khách hàng đã được lọc"
    })
  }

  const getStatusText = (status: string) => {
    return status === 'in_use' ? 'Đang sử dụng' : 'Có sẵn'
  }

  const getStatusColor = (status: string) => {
    return status === 'in_use' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý khách hàng</h1>
          <Button variant="outline" onClick={signOut}>
            Đăng xuất
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
