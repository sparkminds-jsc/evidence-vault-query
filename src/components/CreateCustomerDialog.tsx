
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface CreateCustomerDialogProps {
  newCustomer: {
    email: string
    fullName: string
  }
  onCustomerChange: (customer: { email: string; fullName: string }) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  creatingCustomer: boolean
}

const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({
  newCustomer,
  onCustomerChange,
  onSubmit,
  onCancel,
  creatingCustomer
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Auditee</DialogTitle>
        <DialogDescription>
          Enter information to create a new auditee
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-fullName">Full Name</Label>
          <Input
            id="customer-fullName"
            value={newCustomer.fullName}
            onChange={(e) => onCustomerChange({ ...newCustomer, fullName: e.target.value })}
            required
            placeholder="Enter auditee full name"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={creatingCustomer}>
            {creatingCustomer ? "Creating..." : "Create Auditee"}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}

export default CreateCustomerDialog
