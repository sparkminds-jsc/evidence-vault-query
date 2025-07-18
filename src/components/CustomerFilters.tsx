
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus } from 'lucide-react'

interface CustomerFiltersProps {
  filters: {
    name: string
    email: string
  }
  onFiltersChange: (filters: { name: string; email: string }) => void
  onSearch: () => void
  onCreateClick: () => void
  createDialogOpen: boolean
  children: React.ReactNode
}

const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  onCreateClick,
  createDialogOpen,
  children
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="name-filter">Auditee Name</Label>
            <Input
              id="name-filter"
              placeholder="Enter auditee name"
              value={filters.name}
              onChange={(e) => onFiltersChange({ ...filters, name: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSearch} variant="custom" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={() => {}}>
              <DialogTrigger asChild>
                <Button onClick={onCreateClick} variant="custom" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Auditee
                </Button>
              </DialogTrigger>
              {children}
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerFilters
