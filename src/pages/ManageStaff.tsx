
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
import { Trash2, Plus } from 'lucide-react'

interface StaffMember {
  id: string
  full_name: string | null
  email: string | null
  status: string | null
  created_at: string
}

const ManageStaff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newStaff, setNewStaff] = useState({
    email: '',
    fullName: '',
    password: ''
  })
  const [creatingStaff, setCreatingStaff] = useState(false)
  const { createStaff, signOut } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching staff:', error)
        return
      }

      setStaff(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingStaff(true)

    try {
      const { error } = await createStaff(newStaff.email, newStaff.password, newStaff.fullName)

      if (error) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tạo tài khoản nhân viên",
          variant: "destructive"
        })
      } else {
        setCreateDialogOpen(false)
        setNewStaff({ email: '', fullName: '', password: '' })
        fetchStaff()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
        variant: "destructive"
      })
    } finally {
      setCreatingStaff(false)
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', staffId)

      if (error) {
        toast({
          title: "Lỗi",
          description: "Không thể xóa nhân viên",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Thành công",
          description: "Đã xóa nhân viên thành công"
        })
        fetchStaff()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi không mong muốn",
        variant: "destructive"
      })
    }
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý nhân viên</h1>
          <div className="flex gap-2">
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo nhân viên
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo nhân viên mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin để tạo tài khoản nhân viên mới
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateStaff} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="Nhập email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      value={newStaff.fullName}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, password: e.target.value }))}
                      required
                      placeholder="Nhập mật khẩu"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button type="submit" disabled={creatingStaff}>
                      {creatingStaff ? "Đang tạo..." : "Tạo nhân viên"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={signOut}>
              Đăng xuất
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách nhân viên</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Tên nhân viên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member, index) => (
                  <TableRow key={member.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{member.full_name || '--'}</TableCell>
                    <TableCell>{member.email || '--'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        member.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(member.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteStaff(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {staff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      Chưa có nhân viên nào
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

export default ManageStaff
