
import React from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import CreateStaffDialog from '@/components/CreateStaffDialog'
import StaffTable from '@/components/StaffTable'
import { useStaffManagement } from '@/hooks/useStaffManagement'

const ManageStaff = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()
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
            <h1 className="text-3xl font-bold">Manage Staff</h1>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div></div>
          <CreateStaffDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            newStaff={newStaff}
            onStaffChange={setNewStaff}
            onSubmit={handleCreateStaff}
            creatingStaff={creatingStaff}
          />
        </div>

        <StaffTable staff={staff} onDeleteStaff={handleDeleteStaff} />
      </div>
    </div>
  )
}

export default ManageStaff
