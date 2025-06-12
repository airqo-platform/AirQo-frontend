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

  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchNetworkPermissions = useCallback(async () => {

    if (isLoading) return []

    setIsLoading(true)
    setError(null)
    try {
      const response = await users.getNetworkPermissionsApi()

      let permissionsArray: Permission[] = []
      if (response && typeof response === "object") {
        if (Array.isArray(response.permissions)) {
          permissionsArray = response.permissions
        } else if (Array.isArray(response)) {
          permissionsArray = response
        }
      }

      setPermissions(permissionsArray)
      return permissionsArray
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch permissions")
      setError(error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const assignPermissionsToRole = useCallback(async (roleId: string, permission_ids: string[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await users.assignPermissionsToRoleApi(roleId, { permission_ids })
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

  const updateRolePermissions = useCallback(async (roleId: string, permission_ids: string[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await users.updatePermissionsToRoleApi(roleId, { permission_ids })
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
