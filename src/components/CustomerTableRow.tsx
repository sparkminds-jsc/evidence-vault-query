
import React from 'react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Trash2, FileText, UserCheck } from 'lucide-react'

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
  created_at: string
  updated_at: string
}

interface CustomerTableRowProps {
  customer: Customer
  index: number
  onUseToAudit: (customerId: string) => void
  onDelete: (customerId: string) => void
  updatingStatus: string | null
  getStatusText: (status: string) => string
  getStatusColor: (status: string) => string
}

const CustomerTableRow: React.FC<CustomerTableRowProps> = ({
  customer,
  index,
  onUseToAudit,
  onDelete,
  updatingStatus,
  getStatusText,
  getStatusColor
}) => {
  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{customer.email}</TableCell>
      <TableCell>{customer.full_name}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
          {getStatusText(customer.status)}
        </span>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Xem tài liệu
        </Button>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onUseToAudit(customer.id)}
            disabled={customer.status === 'in_use' || updatingStatus === customer.id}
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            {updatingStatus === customer.id ? "Đang cập nhật..." : "Use To Audit"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(customer.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default CustomerTableRow
