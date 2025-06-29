
import React, { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Plus, Search, FileText } from 'lucide-react'

interface Customer {
  id: string
  email: string
  full_name: string
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

  const handleSearch = () => {
    // The filtering is already handled by useEffect, so this is just for user experience
    toast({
      title: "Tìm kiếm",
      description: "Danh sách khách hàng đã được lọc"
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
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

        {/* Filter Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="name-filter">Tên khách hàng</Label>
                <Input
                  id="name-filter"
                  placeholder="Nhập tên khách hàng"
                  value={filters.name}
                  onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-filter">Email</Label>
                <Input
                  id="email-filter"
                  placeholder="Nhập email"
                  value={filters.email}
                  onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Tìm kiếm
                </Button>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Tạo khách hàng
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tạo khách hàng mới</DialogTitle>
                      <DialogDescription>
                        Nhập thông tin để tạo khách hàng mới
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCustomer} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer-email">Email</Label>
                        <Input
                          id="customer-email"
                          type="email"
                          value={newCustomer.email}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                          required
                          placeholder="Nhập email khách hàng"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer-fullName">Họ và tên</Label>
                        <Input
                          id="customer-fullName"
                          value={newCustomer.fullName}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, fullName: e.target.value }))}
                          required
                          placeholder="Nhập họ và tên khách hàng"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                          Hủy
                        </Button>
                        <Button type="submit" disabled={creatingCustomer}>
                          {creatingCustomer ? "Đang tạo..." : "Tạo khách hàng"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Email khách hàng</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Danh sách tài liệu</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer, index) => (
                  <TableRow key={customer.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.full_name}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Xem tài liệu
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      {customers.length === 0 ? 'Chưa có khách hàng nào' : 'Không tìm thấy khách hàng phù hợp'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ManageCustomer
