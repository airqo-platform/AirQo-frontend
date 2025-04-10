"use client"

import { useState, useCallback } from "react"
import { users } from "@/core/apis/users"

export interface Permission {
  _id: string
  permission: string
  description: string
}

export interface PermissionsResponse {
  success: boolean
  message: string
  permissions: Permission[]
}

export function usePermissions() {
  // Initialize permissions as an empty array to prevent filter errors
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  // Use useCallback to prevent the function from being recreated on every render
  const fetchNetworkPermissions = useCallback(async () => {
    // Check if we're already loading to prevent duplicate calls
    if (isLoading) return []

    setIsLoading(true)
    setError(null)
    try {
      const response = await users.getNetworkPermissionsApi()
      console.log("API Response:", response)

      // Extract permissions from the nested structure
      let permissionsArray: Permission[] = []

      // Check if response has the expected structure
      if (response && typeof response === "object") {
        if (Array.isArray(response.permissions)) {
          // If response has a permissions array property
          permissionsArray = response.permissions
        } else if (Array.isArray(response)) {
          // If response itself is an array
          permissionsArray = response
        }
      }

      console.log("Extracted permissions:", permissionsArray)
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
  }, [isLoading]) // Only depends on isLoading state

  const assignPermissionsToRole = useCallback(async (roleId: string, permissionIds: string[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await users.assignPermissionsToRoleApi(roleId, { permissionIds })
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to assign permissions")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removePermissionFromRole = useCallback(async (roleId: string, permissionId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await users.removePermissionsFromRoleApi(roleId, permissionId)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to remove permission")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateRolePermissions = useCallback(async (roleId: string, permissionIds: string[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await users.updatePermissionsToRoleApi(roleId, { permissionIds })
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update permissions")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

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
