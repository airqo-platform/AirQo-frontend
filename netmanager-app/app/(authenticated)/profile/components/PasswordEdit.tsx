"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PasswordEdit() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the new password to your backend
    console.log("Password change request:", passwords)
    // Reset form after submission
    setPasswords({ current: "", new: "", confirm: "" })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <Input
            id="current-password"
            name="current"
            type="password"
            value={passwords.current}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            name="new"
            type="password"
            value={passwords.new}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <Input
            id="confirm-password"
            name="confirm"
            type="password"
            value={passwords.confirm}
            onChange={handleInputChange}
            required
          />
        </div>
        <Button type="submit">Change Password</Button>
      </form>
    </div>
  )
}

