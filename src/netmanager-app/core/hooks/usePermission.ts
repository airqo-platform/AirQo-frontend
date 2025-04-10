"use client"

import { useState } from "react"
import { users } from "@/core/apis/users"

export interface Permission {
  _id: string
  permission: string
  description: string
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchNetworkPermissions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await users.getNetworkPermissionsApi()
      setPermissions(data)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch permissions")
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const assignPermissionsToRole = async (roleId: string, permissionIds: string[]) => {
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
  }

  const removePermissionFromRole = async (roleId: string, permissionId: string) => {
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
  }

  const updateRolePermissions = async (roleId: string, permissionIds: string[]) => {
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
