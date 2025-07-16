
import { FileText, Upload, Table, MessageSquare, LogOut } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { getTranslation } from "@/utils/translations"
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
  language?: 'EN' | 'FR'
}

const menuItems = [
  {
    id: "upload-questions",
    title: "Framework",
    translationKey: "framework",
    icon: Upload,
    description: "Upload Excel file with security questions",
    type: "section"
  },
  {
    id: "upload-data",
    title: "Documentation",
    translationKey: "documentation",
    icon: FileText,
    description: "Upload PDF or DOCX documents",
    type: "section"
  },
  {
    id: "evidence-table",
    title: "Audit",
    translationKey: "audit",
    icon: Table,
    description: "View questions, answers, and evidence",
    type: "section"
  },
  {
    id: "feedbacks",
    title: "Fine Tuning",
    translationKey: "fineTuning",
    icon: MessageSquare,
    description: "View feedback history and manage records",
    type: "section"
  },
]

const routeItems = [
  // Remove the Auditees and Evidence Tuning items from the sidebar
  // They are now only available in the user profile dropdown
]

export function AppSidebar({ activeSection, onSectionChange, language = 'EN' }: AppSidebarProps) {
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
        <div className="flex items-center justify-center pt-5">
          <img 
            src="/lovable-uploads/3ba0123f-293a-4c6a-9c9e-d1131fc7b42e.png" 
            alt="Logo" 
            className="w-40 h-40 object-contain"
          />
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
                    className={`w-full flex items-center gap-3 p-3 text-left rounded-lg sidebar-menu-item text-base ${
                      isActive(item) ? 'active bg-sidebar-accent' : 'hover:bg-sidebar-accent'
                    }`}
                  >
                    <item.icon className="flex-shrink-0" size={20} />
                    <span className="font-bold text-sidebar-foreground text-base">{getTranslation(item.translationKey || item.title.toLowerCase(), language)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={isActive(item)}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center gap-3 p-3 text-left rounded-lg sidebar-menu-item text-base ${
                      isActive(item) ? 'active bg-sidebar-accent' : 'hover:bg-sidebar-accent'
                    }`}
                  >
                    <item.icon className="flex-shrink-0" size={20} />
                    <span className="font-bold text-sidebar-foreground text-base">{getTranslation(item.translationKey || item.title.toLowerCase(), language)}</span>
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
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg sidebar-menu-item hover:bg-sidebar-accent text-base"
            >
              <LogOut className="flex-shrink-0" size={20} />
              <span className="font-bold text-sidebar-foreground text-base">{getTranslation('logOut', language)}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
