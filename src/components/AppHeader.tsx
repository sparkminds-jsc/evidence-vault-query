
import React, { useState } from 'react'
import { ChevronDown, User, Lock, Users, LogOut, Globe } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function AppHeader() {
  const { signOut } = useAuth()
  const [currentLanguage, setCurrentLanguage] = useState('EN')

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang)
    // Here you would implement actual language switching logic
    console.log('Language changed to:', lang)
  }

  const handleProfileClick = () => {
    console.log('Profile clicked')
  }

  const handleChangePasswordClick = () => {
    console.log('Change Password clicked')
  }

  const handleYourColleagueClick = () => {
    console.log('Your Colleague clicked')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left side - Avatar and Language */}
      <div className="flex items-center gap-4">
        {/* Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="User Avatar" />
                <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                  SJ
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={handleProfileClick} className="flex items-center gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleChangePasswordClick} className="flex items-center gap-2 cursor-pointer">
              <Lock className="h-4 w-4" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleYourColleagueClick} className="flex items-center gap-2 cursor-pointer">
              <Users className="h-4 w-4" />
              Your Colleague
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 cursor-pointer text-red-600">
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md">
              <Globe className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{currentLanguage}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-32">
            <DropdownMenuItem 
              onClick={() => handleLanguageChange('EN')} 
              className="cursor-pointer"
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleLanguageChange('FR')} 
              className="cursor-pointer"
            >
              Français
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right side - Welcome message */}
      <div className="text-gray-700 font-medium">
        Hello, welcome back!
      </div>
    </header>
  )
}
