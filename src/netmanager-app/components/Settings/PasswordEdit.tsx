"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppSelector } from "@/core/redux/hooks"
import { settings } from "@/core/apis/settings"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff } from "lucide-react"

export default function PasswordEdit() {
  const currentUser = useAppSelector((state) => state.user.userDetails)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords({ ...passwords, [name]: value })
    validateField(name, value)
  }

  const validateField = (name: string, value: string) => {
    let error = ""
    switch (name) {
      case "currentPassword":
        if (!value) error = "Current password is required"
        break
      case "newPassword":
        if (!value) {
          error = "New password is required"
        } else if (!passwordRegex.test(value)) {
          error =
            "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
        }
        break
      case "confirmNewPassword":
        if (!value) {
          error = "Please confirm your new password"
        } else if (value !== passwords.newPassword) {
          error = "Passwords do not match"
        }
        break
    }
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.match(/[A-Z]/)) strength += 25
    if (password.match(/[a-z]/)) strength += 25
    if (password.match(/[0-9]/)) strength += 25
    return strength
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not found.",
        variant: "destructive",
      })
      return
    }

    const userId = currentUser._id
    const { currentPassword, newPassword } = passwords

    Object.entries(passwords).forEach(([key, value]) => validateField(key, value))

    if (Object.values(errors).some((error) => error)) {
      toast({
        title: "Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      })
      return
    }

    const pwdData = {
      password: newPassword,
      old_password: currentPassword,
    }

    try {
      setIsLoading(true)
      const response = await settings.updateUserPasswordApi(userId, pwdData)

      if (response) {
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        })
        toast({
          title: "Success",
          description: "Password updated successfully.",
        })
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "An error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showPassword.current ? "text" : "password"}
              value={passwords.currentPassword}
              onChange={handleInputChange}
              required
              aria-invalid={!!errors.currentPassword}
              aria-describedby="currentPassword-error"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => togglePasswordVisibility("current")}
            >
              {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.currentPassword && (
            <p id="currentPassword-error" className="text-sm text-red-500">
              {errors.currentPassword}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword.new ? "text" : "password"}
              value={passwords.newPassword}
              onChange={handleInputChange}
              required
              aria-invalid={!!errors.newPassword}
              aria-describedby="newPassword-error"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => togglePasswordVisibility("new")}
            >
              {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.newPassword && (
            <p id="newPassword-error" className="text-sm text-red-500">
              {errors.newPassword}
            </p>
          )}
          <Progress value={calculatePasswordStrength(passwords.newPassword)} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Password strength: {calculatePasswordStrength(passwords.newPassword)}%
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type={showPassword.confirm ? "text" : "password"}
              value={passwords.confirmNewPassword}
              onChange={handleInputChange}
              required
              aria-invalid={!!errors.confirmNewPassword}
              aria-describedby="confirmNewPassword-error"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => togglePasswordVisibility("confirm")}
            >
              {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.confirmNewPassword && (
            <p id="confirmNewPassword-error" className="text-sm text-red-500">
              {errors.confirmNewPassword}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Changing Password..." : "Change Password"}
        </Button>
      </form>
    </div>
  )
}

