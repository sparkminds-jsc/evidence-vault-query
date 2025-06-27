
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { AppSidebar } from "@/components/AppSidebar"
import { UploadQuestions } from "@/components/UploadQuestions"
import { UploadData } from "@/components/UploadData"
import { EvidenceTable } from "@/components/EvidenceTable"
import { useAuth } from "@/contexts/AuthContext"

const Index = () => {
  const [activeSection, setActiveSection] = useState("upload-questions")
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect admin to manage staff page
    if (profile?.role === 'admin') {
      navigate('/manage-staff')
    }
  }, [profile, navigate])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const renderContent = () => {
    switch (activeSection) {
      case "upload-questions":
        return <UploadQuestions />
      case "upload-data":
        return <UploadData />
      case "evidence-table":
        return <EvidenceTable />
      default:
        return <UploadQuestions />
    }
  }

  // Don't render if admin (they'll be redirected)
  if (profile?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang chuyển hướng...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Xin chào, {profile?.full_name || 'Staff'}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default Index
