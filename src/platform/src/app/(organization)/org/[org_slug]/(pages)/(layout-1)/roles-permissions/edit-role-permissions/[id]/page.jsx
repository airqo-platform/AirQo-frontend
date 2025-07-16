'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/common/components/Button';
import { FiArrowLeft } from 'react-icons/fi';
import SearchField from '@/common/components/search/SearchField';
import CardWrapper from '@/common/components/CardWrapper';
import ErrorState from '@/common/components/ErrorState';
import EmptyState from '@/common/components/EmptyState';
import PermissionDenied from '@/common/components/PermissionDenied';
import RolePermissionsSkeleton from '@/common/components/Skeleton/RolePermissionsSkeleton';
import {
  getRoleDetailsApi,
  getAllPermissionsApi,
  updateRolePermissionsApi,
} from '@/core/apis/Account';
import CustomToast from '@/common/components/Toast/CustomToast';
import { useRouter, useParams } from 'next/navigation';

const RolePermissionsEditor = ({ onRefresh }) => {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id;
  const [permissions, setPermissions] = useState([]);
  const [roleData, setRoleData] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Fetch all permissions and role details
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    try {
      const [permsRes, roleRes] = await Promise.all([
        getAllPermissionsApi(),
        getRoleDetailsApi(roleId),
      ]);
      if (!permsRes.success || !roleRes.success) {
        throw new Error(
          permsRes.message || roleRes.message || 'Failed to load data',
        );
      }
      setPermissions(permsRes.permissions || []);
      setRoleData(roleRes.role || roleRes.roles?.[0] || null);
      // Set initially selected permissions
      const initialSelected = new Set(
        (
          roleRes.role?.role_permissions ||
          roleRes.roles?.[0]?.role_permissions ||
          []
        ).map((p) => p.permission),
      );
      setSelectedPermissions(initialSelected);
    } catch (err) {
      if (err?.response?.status === 403 || err?.status === 403) {
        setPermissionDenied(true);
      } else {
        setError(err.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter permissions based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPermissions(permissions);
    } else {
      const filtered = permissions.filter(
        (permission) =>
          permission.permission
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          permission.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
      setFilteredPermissions(filtered);
    }
  }, [permissions, searchTerm]);

  const handlePermissionToggle = (permissionName) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionName)) {
        newSet.delete(permissionName);
      } else {
        newSet.add(permissionName);
      }
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Find permission IDs for selected permissions
      const permission_ids = permissions
        .filter((p) => selectedPermissions.has(p.permission))
        .map((p) => p._id);
      const response = await updateRolePermissionsApi(roleId, {
        permission_ids,
      });
      if (response?.success) {
        CustomToast({
          message: 'Permissions updated successfully!',
          type: 'success',
        });
        if (typeof onRefresh === 'function') onRefresh();
        router.back();
      } else {
        CustomToast({
          message: response?.message || 'Failed to update permissions.',
          type: 'error',
        });
      }
    } catch (err) {
      CustomToast({
        message: err?.message || 'Failed to update permissions.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatPermissionName = (permission) => {
    return permission
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) return <RolePermissionsSkeleton />;
  if (permissionDenied) return <PermissionDenied />;
  if (error) {
    return (
      <ErrorState
        type="server"
        title="Failed to load role permissions"
        description={error}
        onPrimaryAction={fetchData}
      />
    );
  }
  if (!permissions.length) {
    return (
      <EmptyState
        preset="data"
        title="No permissions available"
        description="There are no permissions to assign to this role."
      />
    );
  }

  return (
    <div>
      {/* Header with Back and Save */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="outlined"
          onClick={() => router.back()}
          className="flex items-center text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          padding="p-2"
        >
          <FiArrowLeft className="w-5 h-5 mr-1" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex-1 flex items-center justify-between ml-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Role Permissions
            </h1>
            <p className="text-gray-600">
              Managing permissions for:{' '}
              <span className="font-semibold">{roleData?.role_name}</span>
            </p>
          </div>
          <Button
            variant="filled"
            onClick={handleSaveChanges}
            loading={saving}
            disabled={saving}
            className="ml-4"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchField
          placeholder="Search permissions..."
          onSearch={(e) => setSearchTerm(e.target.value)}
          onClearSearch={() => setSearchTerm('')}
          showSearchResultsNumber={false}
          wrapperClassName="w-full"
        />
      </div>

      {/* Summary */}
      <CardWrapper className="border border-primary/20 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {selectedPermissions.size} of {permissions.length} permissions
              selected
            </p>
            <p className="text-xs text-primary mt-1">
              {selectedPermissions.size === 0
                ? 'No permissions selected'
                : selectedPermissions.size === permissions.length
                  ? 'All permissions selected'
                  : `${permissions.length - selectedPermissions.size} permissions remaining`}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outlined"
              onClick={() => setSelectedPermissions(new Set())}
              size="small"
            >
              Clear All
            </Button>
            <Button
              variant="filled"
              onClick={() =>
                setSelectedPermissions(
                  new Set(permissions.map((p) => p.permission)),
                )
              }
              size="small"
            >
              Select All
            </Button>
          </div>
        </div>
      </CardWrapper>

      {/* Permissions Grid */}
      <CardWrapper>
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Available Permissions
          </h2>
          <div className="max-h-96 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPermissions.map((permission) => {
                const isSelected = selectedPermissions.has(
                  permission.permission,
                );
                return (
                  <div
                    key={permission._id}
                    className={`relative rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() =>
                      handlePermissionToggle(permission.permission)
                    }
                  >
                    <div className="p-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`relative w-5 h-5 rounded border-2 transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white absolute top-0.5 left-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-sm font-medium transition-colors duration-200 ${
                              isSelected ? 'text-primary' : 'text-gray-900'
                            }`}
                          >
                            {formatPermissionName(permission.permission)}
                          </h3>
                          <p
                            className={`text-xs mt-1 transition-colors duration-200 ${
                              isSelected ? 'text-primary' : 'text-gray-500'
                            }`}
                          >
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredPermissions.length === 0 && (
              <EmptyState
                preset="search"
                title="No permissions found"
                description="No permissions found matching your search. Try adjusting your search terms."
              />
            )}
          </div>
        </div>
      </CardWrapper>
    </div>
  );
};

export default RolePermissionsEditor;
