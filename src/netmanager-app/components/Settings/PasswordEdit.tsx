"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppSelector } from "@/core/redux/hooks"
import { settings } from "@/core/apis/settings"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, CheckCircle, XCircle, Lock, ShieldCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

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
          error = "Password must meet all requirements"
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

  const renderPasswordStrength = () => {
    const strength = calculatePasswordStrength(passwords.newPassword)
    let color = "bg-red-500"
    let text = "Weak"

    if (strength >= 75) {
      color = "bg-green-500"
      text = "Strong"
    } else if (strength >= 50) {
      color = "bg-yellow-500"
      text = "Medium"
    }

    return (
      <div className="space-y-1">
        <Progress value={strength} className={`w-full ${color}`} />
        <p className="text-xs text-muted-foreground">
          Password strength: <span className="font-medium">{text}</span>
        </p>
      </div>
    )
  }

  const renderPasswordRequirements = () => {
    const requirements = [
      { text: "8+ characters", regex: /.{8,}/ },
      { text: "Uppercase", regex: /[A-Z]/ },
      { text: "Lowercase", regex: /[a-z]/ },
      { text: "Number", regex: /[0-9]/ },
      { text: "Special char", regex: /[@$!%*?&]/ },
    ]

    return (
      <ul className="grid grid-cols-2 gap-1 text-xs">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center space-x-1">
            {req.regex.test(passwords.newPassword) ? (
              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
            )}
            <span className="truncate">{req.text}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="flex flex-col md:flex-row w-full gap-6">
      <div className="w-full md:w-1/3 space-y-4">
        <div className="flex items-center space-x-2 text-primary">
          <ShieldCheck className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Password Security</h2>
        </div>
        <p className="text-muted-foreground">
          Keeping your account secure is our top priority. Regularly updating your password helps protect your personal
          information.
        </p>
        <ul className="space-y-2">
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <span>Use a unique password for each account</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <span>Avoid using personal information in your password</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <span>Consider using a password manager for added security</span>
          </li>
        </ul>
      </div>
      <Card className="w-full md:w-2/3 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={handleInputChange}
                  required
                  className="pr-10"
                  aria-invalid={!!errors.currentPassword}
                  aria-describedby="currentPassword-error"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.currentPassword && (
                <p id="currentPassword-error" className="text-xs text-red-500">
                  {errors.currentPassword}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={handleInputChange}
                  required
                  className="pr-10"
                  aria-invalid={!!errors.newPassword}
                  aria-describedby="newPassword-error"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.newPassword && (
                <p id="newPassword-error" className="text-xs text-red-500">
                  {errors.newPassword}
                </p>
              )}
              {renderPasswordStrength()}
              {renderPasswordRequirements()}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwords.confirmNewPassword}
                  onChange={handleInputChange}
                  required
                  className="pr-10"
                  aria-invalid={!!errors.confirmNewPassword}
                  aria-describedby="confirmNewPassword-error"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmNewPassword && (
                <p id="confirmNewPassword-error" className="text-xs text-red-500">
                  {errors.confirmNewPassword}
                </p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            onClick={(e) => handleSubmit(e as React.FormEvent<HTMLFormElement>)}
          >
            {isLoading ? "Changing Password..." : "Change Password"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

