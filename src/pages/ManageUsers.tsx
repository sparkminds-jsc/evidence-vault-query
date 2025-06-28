
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Trash2, Plus, LogOut, Search } from 'lucide-react'

interface AppUser {
  id: string
  full_name: string
  email: string
  created_at: string
}

const ManageUsers = () => {
  const [usersList, setUsersList] = useState<AppUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: ''
  })
  const [filterData, setFilterData] = useState({
    name: '',
    email: ''
  })
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const fetchUsers = async () => {
    try {
      // This is a simplified approach - in a real app you'd have a users table
      // For now, we'll show placeholder data
      const placeholderUsers: AppUser[] = [
        {
          id: '1',
          full_name: 'John Doe',
          email: 'john@example.com',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          email: 'jane@example.com',
          created_at: new Date().toISOString()
        }
      ]
      
      setUsersList(placeholderUsers)
      setFilteredUsers(placeholderUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = () => {
    const filtered = usersList.filter(user => {
      const nameMatch = filterData.name === '' || 
        user.full_name.toLowerCase().includes(filterData.name.toLowerCase())
      const emailMatch = filterData.email === '' ||
        user.email.toLowerCase().includes(filterData.email.toLowerCase())
      return nameMatch && emailMatch
    })
    setFilteredUsers(filtered)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      // In a real implementation, you would create the user here
      const newUser: AppUser = {
        id: Date.now().toString(),
        full_name: formData.fullName,
        email: formData.email,
        created_at: new Date().toISOString()
      }

      setUsersList(prev => [...prev, newUser])
      setFilteredUsers(prev => [...prev, newUser])

      toast({
        title: "Thành công",
        description: "Tạo người dùng mới thành công"
      })

      setFormData({ email: '', fullName: '' })
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo người dùng mới",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return
    }

    try {
      setUsersList(prev => prev.filter(user => user.id !== userId))
      setFilteredUsers(prev => prev.filter(user => user.id !== userId))

      toast({
        title: "Thành công",
        description: "Xóa người dùng thành công"
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa người dùng",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Xin chào, {profile?.full_name || 'Staff'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Filter Section */}
          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="filterName">Tên</Label>
                  <Input
                    id="filterName"
                    value={filterData.name}
                    onChange={(e) => setFilterData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Tìm theo tên"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="filterEmail">Email</Label>
                  <Input
                    id="filterEmail"
                    value={filterData.email}
                    onChange={(e) => setFilterData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Tìm theo email"
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Tìm kiếm
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo người dùng
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tạo người dùng mới</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Nhập email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Họ tên</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Nhập họ tên"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={creating}>
                        {creating ? 'Đang tạo...' : 'Tạo người dùng'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Danh sách tài liệu</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>
                          <span className="text-blue-600 cursor-pointer hover:underline">
                            Xem tài liệu
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Không tìm thấy người dùng nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ManageUsers
