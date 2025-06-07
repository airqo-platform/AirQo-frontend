"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Search, RefreshCw, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { config } from "@/lib/config"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  status: "active" | "inactive" | "pending"
  created_at: string
  phone?: string
  location?: string
}

const userRoles = [
  { value: "administrator", label: "Administrator" },
  { value: "data_analyst", label: "Data Analyst" },
  { value: "field_technician", label: "Field Technician" },
  { value: "viewer", label: "Viewer" },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    status: "active"
  })
  const [error, setError] = useState<string | null>(null)

  // Function to get auth token with proper error handling
  const getAuthToken = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.")
    }
    return token
  }

  const fetchUsers = async () => {
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
      
      // Try different authorization header formats
      const headers = {
        'Authorization': `Bearer ${token}`
        // Some APIs might expect 'Token' instead of 'Bearer'
        // Uncomment the line below if the API expects a different format
        // 'Authorization': `Token ${token}`
      }
      
      console.log("Fetching users with headers:", headers)
      
      const response = await fetch(`${ config.apiUrl}/users/`, { headers })

      if (response.status === 401 || response.status === 403) {
        throw new Error("Could not validate credentials. Please log in again.")
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", response.status, errorData)
        throw new Error(errorData.detail || `Failed to fetch users: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Fetched users data:", data)
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setUsers(data)
      } else if (data.users && Array.isArray(data.users)) {
        setUsers(data.users)
      } else if (typeof data === 'object' && data !== null) {
        // If the API returns an object with user data not in a 'users' property
        // This handles cases where API might return {results: [...]} or other formats
        const possibleArrayProps = Object.keys(data).find(key => Array.isArray(data[key]))
        if (possibleArrayProps) {
          setUsers(data[possibleArrayProps])
        } else {
          console.warn("Unexpected API response format:", data)
          setUsers([])
        }
      } else {
        console.error("Invalid API response format:", data)
        throw new Error("Invalid response format from server")
      }
    } catch (error: any) {
      console.error("Error fetching users:", error)
      setError(error.message || "Failed to load users")
      toast({
        title: "Error",
        description: error.message || "Failed to load users",
        variant: "destructive",
      })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    try {
      let token
      try {
        token = getAuthToken()
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
        return
      }
      
      const response = await fetch(`${ config.apiUrl}/users/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      if (response.status === 401 || response.status === 403) {
        throw new Error("Could not validate credentials. Please log in again.")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Failed to add user: ${response.status}`)
      }

      toast({
        title: "Success",
        description: "User added successfully",
      })
      setIsDialogOpen(false)
      setNewUser({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "",
        password: "",
        status: "active"
      })
      fetchUsers()
    } catch (error: any) {
      console.error("Error adding user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      })
    }
  }

  const handleLogin = () => {
    // Redirect to login page
    window.location.href = '/login'
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setNewUser({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "",
      password: "",
      status: "active"
    })
  }

  useEffect(() => { 
    fetchUsers() 
  }, [])

  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500">Active</Badge>
      case 'inactive': return <Badge className="bg-gray-500">Inactive</Badge>
      case 'pending': return <Badge className="bg-yellow-500">Pending</Badge>
      default: return <Badge>Unknown</Badge>
    }
  }

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
          <CardTitle className="flex justify-between items-center">
            <span>User Management</span>
            <div className="flex gap-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button onClick={fetchUsers} variant="outline" className="mr-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input 
                          value={newUser.first_name}
                          onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input 
                          value={newUser.last_name}
                          onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input 
                        type="tel"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                        placeholder="Optional"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input 
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select 
                        value={newUser.role}
                        onValueChange={(value) => setNewUser({...newUser, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {userRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddUser}
                      disabled={!newUser.first_name || !newUser.last_name || 
                                !newUser.email || !newUser.password || !newUser.role}
                    >
                      Add User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {error && !error.includes("credentials") ? (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          ) : null}
          
          {users.length === 0 && !loading && !error ? (
            <div className="py-6 text-center text-gray-500">
              <p>No users found. Add users to populate this table.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.first_name[0]}{user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.first_name} {user.last_name}</span>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role.replace('_', ' ')}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}