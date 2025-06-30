
import React from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import AdminSidebar from '@/components/AdminSidebar'
import CreateStaffDialog from '@/components/CreateStaffDialog'
import StaffTable from '@/components/StaffTable'
import { useStaffManagement } from '@/hooks/useStaffManagement'

const ManageStaff = () => {
  const { signOut } = useAuth()
  const {
    staff,
    loading,
    createDialogOpen,
    setCreateDialogOpen,
    newStaff,
    setNewStaff,
    creatingStaff,
    handleCreateStaff,
    handleDeleteStaff
  } = useStaffManagement()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Staff</h1>
            <div className="flex gap-2">
              <CreateStaffDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                newStaff={newStaff}
                onStaffChange={setNewStaff}
                onSubmit={handleCreateStaff}
                creatingStaff={creatingStaff}
              />
              <Button variant="outline" onClick={signOut}>
                Logout
              </Button>
            </div>
          </div>

          <StaffTable staff={staff} onDeleteStaff={handleDeleteStaff} />
        </div>
      </div>
    </div>
  )
}

export default ManageStaff
