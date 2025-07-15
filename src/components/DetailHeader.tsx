
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const DetailHeader = () => {
  const { user, profile } = useAuth()
  const [selectedLanguage, setSelectedLanguage] = useState({ code: 'EN', name: 'English', flag: '🇺🇸' })

  const languages = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'FR', name: 'Français', flag: '🇫🇷' }
  ]

  const getStaffName = () => {
    if (profile?.full_name) {
      return profile.full_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'Staff'
  }

  const getStaffEmail = () => {
    return user?.email || 'staff@company.com'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2)
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* Left side - Greeting */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900">
          Hello {getStaffName()}!
        </h1>
      </div>

      {/* Right side - Language and User Profile */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <span className="text-lg">{selectedLanguage.flag}</span>
              {selectedLanguage.code}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => setSelectedLanguage(language)}
                className={selectedLanguage.code === language.code ? 'bg-gray-100' : ''}
              >
                <span className="text-lg mr-2">{language.flag}</span>
                {language.code} - {language.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="" alt={getStaffName()} />
                <AvatarFallback className="text-xs">
                  {getInitials(getStaffName())}
                </AvatarFallback>
              </Avatar>
              {getStaffEmail()}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default DetailHeader
