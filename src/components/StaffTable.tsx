
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2 } from 'lucide-react'

interface StaffMember {
  id: string
  full_name: string | null
  email: string | null
  status: string | null
  created_at: string
  email_confirmed_at?: string | null
}

interface StaffTableProps {
  staff: StaffMember[]
  onDeleteStaff: (staffId: string) => void
}

const StaffTable: React.FC<StaffTableProps> = ({ staff, onDeleteStaff }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US')
  }

  const getStatusDisplay = (status: string | null, emailConfirmedAt?: string | null) => {
    // Use the status from our logic, which is based on email confirmation
    const actualStatus = emailConfirmedAt ? 'active' : 'unverified'
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${
        actualStatus === 'active' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        {actualStatus === 'active' ? 'Active' : 'Unverified'}
      </span>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Staff Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member, index) => (
              <TableRow key={member.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{member.full_name || '--'}</TableCell>
                <TableCell>{member.email || '--'}</TableCell>
                <TableCell>
                  {getStatusDisplay(member.status, member.email_confirmed_at)}
                </TableCell>
                <TableCell>{formatDate(member.created_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDeleteStaff(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                  No staff members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default StaffTable
