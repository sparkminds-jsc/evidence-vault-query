
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'

interface CreateStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newStaff: {
    email: string
    fullName: string
    password: string
  }
  onStaffChange: (staff: { email: string; fullName: string; password: string }) => void
  onSubmit: (e: React.FormEvent) => void
  creatingStaff: boolean
}

const CreateStaffDialog: React.FC<CreateStaffDialogProps> = ({
  open,
  onOpenChange,
  newStaff,
  onStaffChange,
  onSubmit,
  creatingStaff
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Staff
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Staff</DialogTitle>
          <DialogDescription>
            Enter information to create a new staff account
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newStaff.email}
              onChange={(e) => onStaffChange({ ...newStaff, email: e.target.value })}
              required
              placeholder="Enter email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={newStaff.fullName}
              onChange={(e) => onStaffChange({ ...newStaff, fullName: e.target.value })}
              required
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={newStaff.password}
              onChange={(e) => onStaffChange({ ...newStaff, password: e.target.value })}
              required
              placeholder="Enter password"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creatingStaff}>
              {creatingStaff ? "Creating..." : "Create Staff"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateStaffDialog
