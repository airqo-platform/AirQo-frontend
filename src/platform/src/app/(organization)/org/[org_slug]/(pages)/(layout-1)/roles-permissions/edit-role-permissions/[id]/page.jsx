'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/common/components/Button';
import { FiArrowLeft } from 'react-icons/fi';
import SearchField from '@/common/components/search/SearchField';
import CardWrapper from '@/common/components/CardWrapper';
import ErrorState from '@/common/components/ErrorState';
import EmptyState from '@/common/components/EmptyState';
import PermissionDenied from '@/common/components/PermissionDenied';
import RolePermissionsSkeleton from '@/common/components/Skeleton/RolePermissionsSkeleton';

// Mock data based on your API responses
const MOCK_PERMISSIONS = [
  {
    _id: '6864d690fe280f0013531dcd',
    permission: 'NETWORK_MANAGEMENT',
    description: 'Full network management access',
  },
  {
    _id: '6864d690fe280f0013531dca',
    permission: 'NETWORK_DELETE',
    description: 'Delete networks',
  },
  {
    _id: '6864d690fe280f0013531dc7',
    permission: 'NETWORK_EDIT',
    description: 'Edit network settings',
  },
  {
    _id: '6864d690fe280f0013531dc4',
    permission: 'NETWORK_CREATE',
    description: 'Create new networks',
  },
  {
    _id: '6864d690fe280f0013531dc1',
    permission: 'NETWORK_VIEW',
    description: 'View network information',
  },
  {
    _id: '6864d690fe280f0013531dbe',
    permission: 'TOKEN_MANAGE',
    description: 'Manage API tokens',
  },
  {
    _id: '6864d690fe280f0013531dbb',
    permission: 'TOKEN_GENERATE',
    description: 'Generate API tokens',
  },
  {
    _id: '6864d690fe280f0013531db8',
    permission: 'API_ACCESS',
    description: 'Access API endpoints',
  },
  {
    _id: '6864d69026980d001358abda',
    permission: 'SETTINGS_EDIT',
    description: 'Edit system settings',
  },
  {
    _id: '6864d69026980d001358abd1',
    permission: 'DATA_EXPORT',
    description: 'Export data',
  },
  {
    _id: '6864d69026980d001358abce',
    permission: 'DATA_VIEW',
    description: 'View data',
  },
  {
    _id: '6864d69026980d001358abc8',
    permission: 'ANALYTICS_VIEW',
    description: 'View analytics',
  },
  {
    _id: '6864d69026980d001358abc5',
    permission: 'DASHBOARD_VIEW',
    description: 'View dashboard',
  },
  {
    _id: '6864d69026980d001358abac',
    permission: 'DEVICE_DEPLOY',
    description: 'Deploy devices',
  },
  {
    _id: '6864d69026980d001358aba9',
    permission: 'DEVICE_VIEW',
    description: 'View devices',
  },
  {
    _id: '6864d68ffe280f0013531d6b',
    permission: 'MEMBER_INVITE',
    description: 'Invite new members',
  },
  {
    _id: '6864d68ffe280f0013531d68',
    permission: 'MEMBER_VIEW',
    description: 'View members',
  },
  {
    _id: '6864d68f26980d001358ab91',
    permission: 'MEMBER_REMOVE',
    description: 'Remove members',
  },
  {
    _id: '6864d68ffe280f0013531d62',
    permission: 'USER_MANAGEMENT',
    description: 'Manage users',
  },
  {
    _id: '6864d68ffe280f0013531d53',
    permission: 'GROUP_MANAGEMENT',
    description: 'Manage groups',
  },
];

// Mock role data - this would come from your role details API
const MOCK_ROLE = {
  _id: '656a48a319878a0013ceae42',
  role_name: 'WHO_SUPER_ADMIN',
  role_permissions: [
    {
      _id: '64549d240a8de000130650c2',
      permission: 'CREATE_UPDATE_AND_DELETE_NETWORK_ROLES',
    },
    { _id: '6864d68ffe280f0013531d6b', permission: 'MEMBER_INVITE' },
    { _id: '6864d68ffe280f0013531d68', permission: 'MEMBER_VIEW' },
    { _id: '6864d69026980d001358abda', permission: 'SETTINGS_EDIT' },
    { _id: '6864d69026980d001358abd1', permission: 'DATA_EXPORT' },
    { _id: '6864d69026980d001358abce', permission: 'DATA_VIEW' },
    { _id: '6864d69026980d001358abc8', permission: 'ANALYTICS_VIEW' },
    { _id: '6864d69026980d001358abc5', permission: 'DASHBOARD_VIEW' },
    { _id: '6864d690fe280f0013531db8', permission: 'API_ACCESS' },
    { _id: '6864d69026980d001358abac', permission: 'DEVICE_DEPLOY' },
    { _id: '6864d69026980d001358aba9', permission: 'DEVICE_VIEW' },
    { _id: '6864d68ffe280f0013531d53', permission: 'GROUP_MANAGEMENT' },
    { _id: '6864d69026980d001358aba6', permission: 'ROLE_ASSIGNMENT' },
    { _id: '6864d690fe280f0013531d9b', permission: 'SITE_CREATE' },
    { _id: '6864d68f26980d001358ab91', permission: 'MEMBER_REMOVE' },
    { _id: '6864d690fe280f0013531d8f', permission: 'DEVICE_MAINTAIN' },
    { _id: '6864d690fe280f0013531d98', permission: 'SITE_VIEW' },
    { _id: '6864d690fe280f0013531dbb', permission: 'TOKEN_GENERATE' },
  ],
};

const RolePermissionsEditor = () => {
  const [permissions, setPermissions] = useState([]);
  const [roleData, setRoleData] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Simulate API calls
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setPermissionDenied(false);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Simulate permission denied
        // setPermissionDenied(true); return;
        // Simulate error
        // throw new Error('Failed to fetch');
        setPermissions(MOCK_PERMISSIONS);
        setRoleData(MOCK_ROLE);
        // Set initially selected permissions
        const initialSelected = new Set(
          MOCK_ROLE.role_permissions.map((p) => p.permission),
        );
        setSelectedPermissions(initialSelected);
      } catch (err) {
        if (err.message === '403') {
          setPermissionDenied(true);
        } else {
          setError(err.message || 'Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Here you would make the actual API call to update role permissions
    console.log('Saving permissions:', Array.from(selectedPermissions));

    setSaving(false);
    // Show success message (you can replace this with a proper toast)
    alert('Permissions updated successfully!');
  };

  const formatPermissionName = (permission) => {
    return permission
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return <RolePermissionsSkeleton />;
  }

  if (permissionDenied) {
    return <PermissionDenied />;
  }

  if (error) {
    return (
      <ErrorState
        type="server"
        title="Failed to load role permissions"
        description={error}
        onPrimaryAction={() => window.location.reload()}
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
          onClick={() => window.history.back()}
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
