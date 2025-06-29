
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import CustomerTableRow from './CustomerTableRow'

interface Customer {
  id: string
  email: string
  full_name: string
  status: string
  created_at: string
  updated_at: string
}

interface CustomerTableProps {
  filteredCustomers: Customer[]
  customers: Customer[]
  onUseToAudit: (customerId: string) => void
  onDelete: (customerId: string) => void
  updatingStatus: string | null
  getStatusText: (status: string) => string
  getStatusColor: (status: string) => string
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  filteredCustomers,
  customers,
  onUseToAudit,
  onDelete,
  updatingStatus,
  getStatusText,
  getStatusColor
}) => {
  return (
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
              <TableHead>Trạng thái</TableHead>
              <TableHead>Danh sách tài liệu</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer, index) => (
              <CustomerTableRow
                key={customer.id}
                customer={customer}
                index={index}
                onUseToAudit={onUseToAudit}
                onDelete={onDelete}
                updatingStatus={updatingStatus}
                getStatusText={getStatusText}
                getStatusColor={getStatusColor}
              />
            ))}
            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  {customers.length === 0 ? 'Chưa có khách hàng nào' : 'Không tìm thấy khách hàng phù hợp'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default CustomerTable
