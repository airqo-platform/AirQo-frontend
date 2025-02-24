"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { settings } from "@/core/apis/settings"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getCountries } from "@/utils/countries"
import { getTimezones } from "@/utils/timezones"
import { users } from "@/core/apis/users"
import { useAppSelector, useAppDispatch } from "@/core/redux/hooks"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, Trash2, User } from "lucide-react"
import { cloudinaryImageUpload } from "@/core/apis/cloudinary"
import { setUserDetails } from "@/core/redux/slices/userSlice"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface Profile {
  firstName: string
  lastName: string
  email: string
  jobTitle?: string
  country?: string
  timezone?: string
  description?: string
  profilePicture?: string
}

export default function MyProfile() {
  const currentUser = useAppSelector((state) => state.user.userDetails)
  const { toast } = useToast()
  const dispatch = useAppDispatch()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countries, setCountries] = useState<{ value: string; label: string }[]>([])
  const [timezones, setTimezones] = useState<{ value: string; label: string }[]>([])
  const [profileUploading, setProfileUploading] = useState(false)

  const fetchUserData = useCallback(async () => {
    if (!currentUser) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await users.getUserDetails(currentUser._id)
      const userData = response?.users?.[0]

      if (userData) {
        setProfile({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          jobTitle: userData.jobTitle || "",
          country: userData.country || "",
          timezone: userData.timezone || "",
          description: userData.description || "",
          profilePicture: userData.profilePicture || "",
        })
      } else {
        setError("User data not found")
      }
    } catch (error) {
      setError("Failed to fetch user data")
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentUser, toast])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  useEffect(() => {
    setCountries(getCountries())
    setTimezones(getTimezones())
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value })
    }
  }

  const handleSelectChange = (name: string) => (value: string) => {
    if (profile) {
      setProfile({ ...profile, [name]: value })
    }
  }

  const handleProfileImageUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "")
    formData.append("folder", "profiles")

    setProfileUploading(true)
    try {
      const responseData = await cloudinaryImageUpload(formData)
      if (profile && currentUser) {
        const updatedProfile = {
          ...profile,
          profilePicture: responseData.secure_url,
        }
        setProfile(updatedProfile)
        await settings.updateUserDetailsApi({ profilePicture: responseData.secure_url }, currentUser._id)
        dispatch(
          setUserDetails({
            ...currentUser,
            profilePicture: responseData.secure_url,
          }),
        )
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      })
    } finally {
      setProfileUploading(false)
    }
  }

  const deleteProfileImage = async () => {
    if (!profile || !currentUser) return

    try {
      const updatedProfile = { ...profile, profilePicture: "" }
      setProfile(updatedProfile)
      await settings.updateUserDetailsApi({ profilePicture: "" }, currentUser._id)
      dispatch(setUserDetails({ ...currentUser, profilePicture: "" }))
      toast({
        title: "Success",
        description: "Profile picture deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete profile picture",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !currentUser) return

    setIsLoading(true)
    try {
      await settings.updateUserDetailsApi(profile, currentUser._id)
      const res = await users.getUserDetails(currentUser._id)
      const updatedUser = res.users[0]

      if (!updatedUser) {
        throw new Error("User details not updated")
      }

      dispatch(setUserDetails({ ...currentUser, ...updatedUser }))
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      setError("Failed to update profile")
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-md">{error}</div>
  }

  if (!profile) {
    return <div className="text-gray-500">No profile data available.</div>
  }

  return (
    <Card className="w-full  mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
        <CardDescription>Manage your personal information and settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24">
              {profile.profilePicture ? (
                <AvatarImage src={profile.profilePicture} alt={`${profile.firstName} ${profile.lastName}`} />
              ) : (
                <AvatarFallback>
                  <User className="w-12 h-12 text-gray-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex gap-4">
              <Button type="button" variant="outline" className="flex items-center" disabled={profileUploading}>
                {profileUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  Update
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageUpdate}
                  disabled={profileUploading}
                />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center text-red-500"
                onClick={deleteProfileImage}
                disabled={!profile.profilePicture}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" value={profile.firstName} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" name="lastName" value={profile.lastName} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile.email} onChange={handleInputChange} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input id="jobTitle" name="jobTitle" value={profile.jobTitle || ""} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={profile.country} onValueChange={handleSelectChange("country")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={profile.timezone} onValueChange={handleSelectChange("timezone")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Bio</Label>
            <Textarea
              id="description"
              name="description"
              value={profile.description || ""}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

