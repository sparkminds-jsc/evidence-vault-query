
import { FileText, Upload, Table, Users, Database, MessageSquare } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

const menuItems = [
  {
    id: "upload-questions",
    title: "Upload Security Questions",
    icon: Upload,
    description: "Upload Excel file with security questions",
    type: "section"
  },
  {
    id: "upload-data",
    title: "Upload Data File",
    icon: FileText,
    description: "Upload PDF or DOCX documents",
    type: "section"
  },
  {
    id: "evidence-table",
    title: "Get Evidence",
    icon: Table,
    description: "View questions, answers, and evidence",
    type: "section"
  },
  {
    id: "feedbacks",
    title: "Feedbacks",
    icon: MessageSquare,
    description: "View feedback history and manage records",
    type: "section"
  },
]

const routeItems = [
  {
    id: "manage-customer",
    title: "Manage Customer",
    icon: Users,
    description: "Manage customers and their status",
    path: "/manage-customer"
  },
  {
    id: "knowledge-data",
    title: "Knowledge Data",
    icon: Database,
    description: "View and manage submitted correct answers",
    path: "/knowledge-data"
  }
]

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

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
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">
            Document Analysis
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routeItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={isActive(item)}
                    onClick={() => handleNavigation(item)}
                    className="w-full flex items-start gap-3 p-3 text-left"
                  >
                    <item.icon className="mt-1 flex-shrink-0" size={20} />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={isActive(item)}
                    onClick={() => handleNavigation(item)}
                    className="w-full flex items-start gap-3 p-3 text-left"
                  >
                    <item.icon className="mt-1 flex-shrink-0" size={20} />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
