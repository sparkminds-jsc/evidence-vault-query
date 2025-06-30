
import React from 'react'
import { Button } from '@/components/ui/button'
import { Users, Database } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AdminSidebar = () => {
  const navigate = useNavigate()

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <Button 
            variant="default" 
            className="w-full justify-start"
            onClick={() => navigate('/manage-staff')}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Staff
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/admin-knowledge-data')}
          >
            <Database className="mr-2 h-4 w-4" />
            Knowledge Data
          </Button>
        </nav>
      </div>
    </div>
  )
}

export default AdminSidebar
