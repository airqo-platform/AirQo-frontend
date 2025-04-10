"use client"

import { useState } from "react"
import { roles } from "@/core/apis/roles"

export interface Permission {
  _id: string
  permission: string
  description: string
}

export function usePermissions() {
  // Initialize permissions as an empty array to prevent filter errors
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchNetworkPermissions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await roles.getNetworkPermissionsApi()
      // Ensure data is an array before setting it
      const permissionsArray = Array.isArray(data) ? data : []
      setPermissions(permissionsArray)
      return permissionsArray
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch permissions")
      setError(error)
      console.error("Error fetching permissions:", error)
      // Return empty array on error to prevent further issues
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const assignPermissionsToRole = async (roleId: string, permissionIds: string[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await roles.assignPermissionsToRoleApi(roleId, { permissions: permissionIds })
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to assign permissions")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removePermissionFromRole = async (roleId: string, permissionId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await roles.removePermissionsFromRoleApi(roleId, permissionId)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to remove permission")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateRolePermissions = async (roleId: string, permissionIds: string[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await roles.updatePermissionsToRoleApi(roleId, { permissions: permissionIds })
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update permissions")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    permissions,
    isLoading,
    error,
    fetchNetworkPermissions,
    assignPermissionsToRole,
    removePermissionFromRole,
    updateRolePermissions,
  }
}
