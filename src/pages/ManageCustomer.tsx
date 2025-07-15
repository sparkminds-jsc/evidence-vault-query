
import { SidebarProvider } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/AdminSidebar"
import { AppHeader } from "@/components/AppHeader"
import CustomerTable from "@/components/CustomerTable"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

const ManageCustomer = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { user } = useAuth()

  const { data: customers = [], refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })

  const filteredCustomers = customers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUseToAudit = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ status: 'in_audit' })
        .eq('id', customerId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Customer status updated to in audit",
      })
      refetch()
    } catch (error) {
      console.error('Error updating customer status:', error)
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      })
      refetch()
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive"
      })
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'in_audit':
        return 'In Audit'
      case 'completed':
        return 'Completed'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'in_audit':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        {/* Header */}
        <AppHeader />
        
        {/* Main content area */}
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Manage Customers</h1>
              <CustomerTable 
                filteredCustomers={filteredCustomers}
                customers={customers}
                onUseToAudit={handleUseToAudit}
                onDelete={handleDelete}
                updatingStatus={null}
                getStatusText={getStatusText}
                getStatusColor={getStatusColor}
              />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default ManageCustomer
