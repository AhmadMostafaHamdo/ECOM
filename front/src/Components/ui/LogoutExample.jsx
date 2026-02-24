"use client"

import React, { useState } from "react"
import LogoutConfirmDialog from "./LogoutConfirmDialog"
import { Button } from "./button"
import { LogOut } from "lucide-react"

const LogoutExample = () => {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      // Simulate logout API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear user session/token
      localStorage.removeItem('userToken')
      sessionStorage.clear()
      
      // Redirect to login page or home
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Logout Example</h2>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Click the logout button to see the confirmation dialog in action.
        </p>
        
        <Button
          onClick={() => setIsLogoutDialogOpen(true)}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <LogoutConfirmDialog
        isOpen={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  )
}

export default LogoutExample
