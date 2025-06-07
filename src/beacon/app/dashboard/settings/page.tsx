"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { RefreshCw, Save, User } from "lucide-react"
import { config } from "@/lib/config"

interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: string
  created_at: string
}

interface ProfileFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  current_password: string
  new_password: string
  confirm_password: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    current_password: "",
    new_password: "",
    confirm_password: ""
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to get auth token with proper error handling
  const getAuthToken = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.")
    }
    return token
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let token
      try {
        token = getAuthToken()
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
        return
      }
      
      const response = await fetch(`${config.apiUrl}/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401 || response.status === 403) {
        throw new Error("Could not validate credentials. Please log in again.")
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to fetch profile: ${response.status}`)
      }
      
      const profileData = await response.json()
      
      setProfile(profileData)
      
      // Populate form with current profile data
      setFormData({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        current_password: "",
        new_password: "",
        confirm_password: ""
      })
    } catch (error: any) {
      console.error("Error fetching profile:", error)
      setError(error.message || "Failed to load profile")
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      // Validate password fields if user is trying to change password
      if (formData.new_password || formData.confirm_password) {
        if (!formData.current_password) {
          toast({
            title: "Error",
            description: "Current password is required to change password",
            variant: "destructive",
          })
          return
        }
        
        if (formData.new_password !== formData.confirm_password) {
          toast({
            title: "Error",
            description: "New passwords do not match",
            variant: "destructive",
          })
          return
        }
        
        if (formData.new_password.length < 6) {
          toast({
            title: "Error",
            description: "New password must be at least 6 characters long",
            variant: "destructive",
          })
          return
        }
      }

      setSaving(true)
      
      let token
      try {
        token = getAuthToken()
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
        setSaving(false)
        return
      }

      // Prepare the update payload
      const updatePayload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone
      }

      // Add password fields only if user is changing password
      if (formData.new_password) {
        updatePayload.current_password = formData.current_password
        updatePayload.new_password = formData.new_password
      }
      
      const response = await fetch(`${config.apiUrl}/users/me/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      })

      if (response.status === 401 || response.status === 403) {
        throw new Error("Could not validate credentials. Please log in again.")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to update profile: ${response.status}`)
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: ""
      }))
      
      // Refresh profile data
      fetchProfile()
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogin = () => {
    // Redirect to login page
    window.location.href = '/login'
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw className="animate-spin h-8 w-8" />
      </div>
    )
  }

  // Show authentication error with login button
  if (error && error.includes("credentials")) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
              <p>{error}</p>
            </div>
            <div className="flex justify-center mt-4">
              <Button onClick={handleLogin}>
                Log In Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your account information and security settings
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && !error.includes("credentials") && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Profile Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Profile Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number (optional)"
              />
            </div>

            {profile && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Role:</strong> {profile.role.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Member since:</strong> {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Password Change Section */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-medium">Change Password</h3>
            <p className="text-sm text-gray-600">
              Leave password fields empty if you don't want to change your password
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={formData.current_password}
                  onChange={(e) => handleInputChange("current_password", e.target.value)}
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => handleInputChange("new_password", e.target.value)}
                  placeholder="Enter your new password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => handleInputChange("confirm_password", e.target.value)}
                  placeholder="Confirm your new password"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={fetchProfile}
              disabled={loading || saving}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button 
              onClick={handleSaveProfile}
              disabled={saving || !formData.first_name || !formData.last_name || !formData.email}
            >
              {saving ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}