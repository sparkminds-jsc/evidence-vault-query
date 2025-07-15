
import { SidebarProvider } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/AdminSidebar"
import { AppHeader } from "@/components/AppHeader"
import StaffTable from "@/components/StaffTable"
import { useStaffManagement } from "@/hooks/useStaffManagement"

const ManageStaff = () => {
  const { staff, deleteStaff } = useStaffManagement()

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        {/* Header */}
        <AppHeader />
        
        {/* Main content area */}
        <div className="flex flex-1">
          <AdminSidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Manage Staff</h1>
              <StaffTable 
                staff={staff} 
                onDeleteStaff={deleteStaff}
              />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default ManageStaff
