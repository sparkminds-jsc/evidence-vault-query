
import { FileText, Upload, Table, Users, Database, MessageSquare, LogOut } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  {
    id: "upload-questions",
    title: "Framework",
    icon: Upload,
    description: "Upload Excel file with security questions",
    type: "section"
  },
  {
    id: "upload-data",
    title: "Documentation",
    icon: FileText,
    description: "Upload PDF or DOCX documents",
    type: "section"
  },
  {
    id: "evidence-table",
    title: "Audit",
    icon: Table,
    description: "View questions, answers, and evidence",
    type: "section"
  },
  {
    id: "feedbacks",
    title: "Fine Tuning",
    icon: MessageSquare,
    description: "View feedback history and manage records",
    type: "section"
  },
]

const routeItems = [
  {
    id: "manage-customer",
    title: "Auditees",
    icon: Users,
    description: "Manage customers and their status",
    path: "/manage-customer"
  },
  {
    id: "knowledge-data",
    title: "Evidence Tuning",
    icon: Database,
    description: "View and manage submitted correct answers",
    path: "/knowledge-data"
  }
]

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()

  const handleNavigation = (item: typeof menuItems[0] | typeof routeItems[0]) => {
    if ('path' in item) {
      navigate(item.path)
    } else {
      onSectionChange(item.id)
    }
  }

  const isActive = (item: typeof menuItems[0] | typeof routeItems[0]) => {
    if ('path' in item) {
      return location.pathname === item.path
    } else {
      return activeSection === item.id
    }
  }

  return (
    <Sidebar className="sidebar-custom border-r-0">
      <SidebarHeader className="sidebar-header">
        <div className="flex items-center gap-3">
          <div className="sidebar-user-avatar">
            SJ
          </div>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {routeItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={isActive(item)}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center gap-3 p-3 text-left rounded-lg sidebar-menu-item ${
                      isActive(item) ? 'active bg-sidebar-accent' : 'hover:bg-sidebar-accent'
                    }`}
                  >
                    <item.icon className="flex-shrink-0" size={20} />
                    <span className="font-medium text-sidebar-foreground">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={isActive(item)}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center gap-3 p-3 text-left rounded-lg sidebar-menu-item ${
                      isActive(item) ? 'active bg-sidebar-accent' : 'hover:bg-sidebar-accent'
                    }`}
                  >
                    <item.icon className="flex-shrink-0" size={20} />
                    <span className="font-medium text-sidebar-foreground">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={signOut}
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg sidebar-menu-item hover:bg-sidebar-accent"
            >
              <LogOut className="flex-shrink-0" size={20} />
              <span className="font-medium text-sidebar-foreground">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
