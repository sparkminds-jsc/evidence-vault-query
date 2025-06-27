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
import { Trash2, Plus, LogOut } from 'lucide-react'

interface Staff {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

const ManageStaff = () => {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: ''
  })
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const fetchStaff = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff')

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return
      }

      const staffWithEmails = await Promise.all(
        profiles.map(async (profile) => {
          const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
          return {
            ...profile,
            email: userData.user?.email || 'N/A'
          }
        })
      )

      setStaffList(staffWithEmails)
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhân viên",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          full_name: formData.fullName,
          role: 'staff'
        }
      })

      if (authError) {
        throw authError
      }

      toast({
        title: "Thành công",
        description: "Tạo nhân viên mới thành công"
      })

      setFormData({ email: '', fullName: '', password: '' })
      setIsDialogOpen(false)
      fetchStaff()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo nhân viên mới",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      return
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(staffId)
      
      if (error) {
        throw error
      }

      toast({
        title: "Thành công",
        description: "Xóa nhân viên thành công"
      })

      fetchStaff()
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa nhân viên",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý hệ thống</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Xin chào, {profile?.full_name || 'Admin'}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quản lý nhân viên</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo nhân viên mới
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo nhân viên mới</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateStaff} className="space-y-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="password">Mật khẩu</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Nhập mật khẩu"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={creating}>
                      {creating ? 'Đang tạo...' : 'Tạo nhân viên'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffList.map((staff, index) => (
                      <TableRow key={staff.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{staff.full_name || 'N/A'}</TableCell>
                        <TableCell>{staff.email}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            Hoạt động
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(staff.created_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteStaff(staff.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {staffList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Chưa có nhân viên nào
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

export default ManageStaff
