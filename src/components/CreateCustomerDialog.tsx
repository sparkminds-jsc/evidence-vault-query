
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
        <DialogTitle>Tạo khách hàng mới</DialogTitle>
        <DialogDescription>
          Nhập thông tin để tạo khách hàng mới
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-email">Email</Label>
          <Input
            id="customer-email"
            type="email"
            value={newCustomer.email}
            onChange={(e) => onCustomerChange({ ...newCustomer, email: e.target.value })}
            required
            placeholder="Nhập email khách hàng"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-fullName">Họ và tên</Label>
          <Input
            id="customer-fullName"
            value={newCustomer.fullName}
            onChange={(e) => onCustomerChange({ ...newCustomer, fullName: e.target.value })}
            required
            placeholder="Nhập họ và tên khách hàng"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={creatingCustomer}>
            {creatingCustomer ? "Đang tạo..." : "Tạo khách hàng"}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}

export default CreateCustomerDialog
