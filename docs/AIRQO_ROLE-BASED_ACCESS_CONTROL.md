# AirQo RBAC API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Permissions & Roles](#permissions--roles)
4. [Admin Endpoints](#admin-endpoints)
5. [Role Management](#role-management)
6. [Permission Management](#permission-management)
7. [User Role Assignment](#user-role-assignment)
8. [Group/Organization Management](#grouporganization-management)
9. [Error Handling](#error-handling)
10. [Frontend Integration Guide](#frontend-integration-guide)
11. [Common Patterns](#common-patterns)

---

## Overview

The AirQo RBAC (Role-Based Access Control) system provides comprehensive access control for the platform. Users can belong to multiple organizations (Groups and Networks) with different roles and permissions in each.

### Key Concepts

- **Permissions**: Granular capabilities (e.g., `USER_VIEW`, `DEVICE_DEPLOY`)
- **Roles**: Collections of permissions (e.g., `AIRQO_SUPER_ADMIN`, `MAKERERE_TECHNICIAN`)
- **Groups**: Organizations that consume air quality data
- **Networks**: Organizations that manufacture air quality sensors
- **Tenants**: System boundaries (default: "airqo")

### Base URL

```
https://api.airqo.net/api/v2/users
```

---

## Authentication

All endpoints require JWT authentication unless otherwise specified.

### Headers Required

```javascript
{
  "Authorization": "JWT <jwt_token>",
  "Content-Type": "application/json"
}
```

### Query Parameters

Most endpoints accept:

- `tenant`: Organization tenant (default: "airqo")

---

## Permissions & Roles

### Standard Permissions

#### System Administration

- `SUPER_ADMIN` - Super administrator with all permissions
- `SYSTEM_ADMIN` - System-wide administrative access
- `DATABASE_ADMIN` - Database administration access

#### Organization Management

- `ORG_CREATE` - Create new organizations
- `ORG_VIEW` - View organization information
- `ORG_UPDATE` - Update organization settings
- `ORG_DELETE` - Delete organizations
- `ORG_APPROVE` - Approve organization requests
- `ORG_REJECT` - Reject organization requests

#### Group Management

- `GROUP_VIEW` - View group information
- `GROUP_CREATE` - Create new groups
- `GROUP_EDIT` - Edit group settings
- `GROUP_DELETE` - Delete groups
- `GROUP_MANAGEMENT` - Full group management access

#### User Management

- `USER_VIEW` - View user information
- `USER_CREATE` - Create new users
- `USER_EDIT` - Edit user information
- `USER_DELETE` - Delete users
- `USER_MANAGEMENT` - Full user management access
- `USER_INVITE` - Invite new users

#### Member Management

- `MEMBER_VIEW` - View organization members
- `MEMBER_INVITE` - Invite new members
- `MEMBER_REMOVE` - Remove members
- `MEMBER_SEARCH` - Search members
- `MEMBER_EXPORT` - Export member data

#### Role & Permission Management

- `ROLE_VIEW` - View roles and permissions
- `ROLE_CREATE` - Create new roles
- `ROLE_EDIT` - Edit existing roles
- `ROLE_DELETE` - Delete roles
- `ROLE_ASSIGNMENT` - Assign roles to users

#### Device Management

- `DEVICE_VIEW` - View device information
- `DEVICE_DEPLOY` - Deploy devices to sites
- `DEVICE_RECALL` - Recall devices from deployment
- `DEVICE_MAINTAIN` - Perform device maintenance
- `DEVICE_UPDATE` - Update device configuration
- `DEVICE_DELETE` - Delete device records

#### Site Management

- `SITE_VIEW` - View site information
- `SITE_CREATE` - Create new sites
- `SITE_UPDATE` - Update site information
- `SITE_DELETE` - Delete sites

#### Analytics & Data

- `DASHBOARD_VIEW` - View dashboard
- `ANALYTICS_VIEW` - View analytics and reports
- `ANALYTICS_EXPORT` - Export analytics data
- `DATA_VIEW` - View data
- `DATA_EXPORT` - Export data
- `DATA_COMPARE` - Compare data across sources

#### Settings & Configuration

- `SETTINGS_VIEW` - View system settings
- `SETTINGS_EDIT` - Edit system settings
- `GROUP_SETTINGS` - Manage group-specific settings

### Standard Role Templates

#### AirQo Roles

- `AIRQO_SUPER_ADMIN` - Complete system access
- `AIRQO_ADMIN` - Organization approval and management

#### Organization Roles (Template)

- `{ORG}_SUPER_ADMIN` - Full organization control
- `{ORG}_ADMIN` - Organization administration
- `{ORG}_TECHNICIAN` - Field operations
- `{ORG}_ANALYST` - Data analysis
- `{ORG}_DEVELOPER` - API and integration access
- `{ORG}_VIEWER` - Read-only access

---

## Admin Endpoints

### Setup Super Admin

Create or assign super admin role to a user.

```http
POST /admin/super-admin
```

**Request Body:**

```json
{
  "secret": "your-admin-setup-secret",
  "user_id": "optional-user-id",
  "tenant": "airqo" // OPTIONAL
}
```

**Response:**

```json
{
  "success": true,
  "message": "User successfully assigned SUPER_ADMIN role",
  "data": {
    "user_id": "64a7b8c9d1e2f3a4b5c6d7e8",
    "role_assigned": "AIRQO_SUPER_ADMIN",
    "role_id": "64a7b8c9d1e2f3a4b5c6d7e9",
    "group": "AirQo",
    "group_id": "64a7b8c9d1e2f3a4b5c6d7ea",
    "tenant": "airqo",
    "status": "newly_assigned",
    "timestamp": "2025-06-05T10:30:00.000Z",
    "next_steps": [
      "User now has super admin access",
      "Try accessing /api/v2/users/org-requests",
      "Check /api/v2/users/admin/rbac-health for system status"
    ]
  }
}
```

### RBAC Health Check

Check the health status of the RBAC system.

```http
GET /admin/rbac-health?tenant=airqo
```

**Response:**

```json
{
  "success": true,
  "message": "RBAC system is operational",
  "health_status": {
    "service": "rbac-system",
    "status": "healthy",
    "permissions_count": 45,
    "roles_count": 12,
    "airqo_roles_count": 2,
    "has_airqo_roles": true,
    "tenant": "airqo",
    "timestamp": "2025-06-05T10:30:00.000Z",
    "recommendations": []
  }
}
```

### RBAC Status (Detailed)

Get comprehensive RBAC system status and recommendations.

```http
GET /admin/rbac-status?tenant=airqo
```

**Response:**

```json
{
  "success": true,
  "message": "RBAC system status retrieved successfully",
  "rbac_status": {
    "system_health": {
      "status": "healthy",
      "permissions_count": 45,
      "total_roles_count": 12,
      "airqo_roles_count": 2,
      "super_admin_role_exists": true
    },
    "user_coverage": {
      "total_users": 150,
      "users_with_roles": 142,
      "coverage_percentage": 95,
      "status": "good"
    },
    "airqo_roles": [
      {
        "id": "64a7b8c9d1e2f3a4b5c6d7e9",
        "name": "AIRQO_SUPER_ADMIN",
        "code": "AIRQO_SUPER_ADMIN",
        "permissions_count": 30
      }
    ],
    "recommendations": ["RBAC system is functioning well"]
  }
}
```

### RBAC Reset (Development)

Reset RBAC system for troubleshooting.

```http
POST /admin/rbac-reset
```

**Request Body:**

```json
{
  "secret": "your-admin-setup-secret",
  "dry_run": true,
  "reset_permissions": false,
  "reset_roles": true,
  "reset_user_roles": false,
  "tenant": "airqo"
}
```

### RBAC Initialize

Force RBAC system initialization.

```http
POST /admin/rbac-initialize
```

**Request Body:**

```json
{
  "secret": "your-admin-setup-secret",
  "force": false,
  "tenant": "airqo"
}
```

---

## Role Management

### List Roles

Get all roles or filter by organization.

```http
GET /roles?tenant=airqo&group_id=64a7b8c9d1e2f3a4b5c6d7ea
```

**Response:**

```json
{
  "success": true,
  "message": "successfully retrieved the roles",
  "roles": [
    {
      "_id": "64a7b8c9d1e2f3a4b5c6d7e9",
      "role_name": "AIRQO_SUPER_ADMIN",
      "role_code": "AIRQO_SUPER_ADMIN",
      "role_description": "AirQo Super Administrator with all permissions",
      "role_status": "ACTIVE",
      "group_id": "64a7b8c9d1e2f3a4b5c6d7ea",
      "role_permissions": [
        {
          "_id": "64a7b8c9d1e2f3a4b5c6d7eb",
          "permission": "SUPER_ADMIN"
        }
      ],
      "createdAt": "2025-06-05T10:00:00.000Z"
    }
  ]
}
```

### Create Role

Create a new role for an organization.

```http
POST /roles?tenant=airqo
```

**Request Body:**

```json
{
  "role_name": "TECHNICIAN",
  "role_description": "Field technician role",
  "group_id": "64a7b8c9d1e2f3a4b5c6d7ea",
  "role_permissions": ["64a7b8c9d1e2f3a4b5c6d7eb", "64a7b8c9d1e2f3a4b5c6d7ec"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Role created successfully",
  "created_role": {
    "_id": "64a7b8c9d1e2f3a4b5c6d7ed",
    "role_name": "MAKERERE_TECHNICIAN",
    "role_code": "MAKERERE_TECHNICIAN",
    "role_description": "Field technician role",
    "group_id": "64a7b8c9d1e2f3a4b5c6d7ea",
    "role_status": "ACTIVE"
  }
}
```

### Update Role

Update an existing role.

```http
PUT /roles/64a7b8c9d1e2f3a4b5c6d7ed?tenant=airqo
```

**Request Body:**

```json
{
  "role_description": "Updated field technician role",
  "role_permissions": ["64a7b8c9d1e2f3a4b5c6d7eb"]
}
```

### Delete Role

Delete a role (removes from all users first).

```http
DELETE /roles/64a7b8c9d1e2f3a4b5c6d7ed?tenant=airqo
```

### Get Role Details

Get detailed information about a specific role.

```http
GET /roles/64a7b8c9d1e2f3a4b5c6d7ed?tenant=airqo
```

---

## Permission Management

### List Permissions

Get all available permissions.

```http
GET /permissions?tenant=airqo
```

**Response:**

```json
{
  "success": true,
  "message": "successfully retrieved the permissions",
  "permissions": [
    {
      "_id": "64a7b8c9d1e2f3a4b5c6d7eb",
      "permission": "SUPER_ADMIN",
      "description": "Super administrator with all permissions",
      "createdAt": "2025-06-05T10:00:00.000Z"
    }
  ]
}
```

### Create Permission

Create a new permission.

```http
POST /permissions?tenant=airqo
```

**Request Body:**

```json
{
  "permission": "CUSTOM_PERMISSION",
  "description": "Custom permission for specific functionality"
}
```

### Role Permission Management

#### List Permissions for Role

```http
GET /roles/64a7b8c9d1e2f3a4b5c6d7ed/permissions?tenant=airqo
```

#### List Available Permissions for Role

```http
GET /roles/64a7b8c9d1e2f3a4b5c6d7ed/available_permissions?tenant=airqo
```

#### Assign Permissions to Role

```http
POST /roles/64a7b8c9d1e2f3a4b5c6d7ed/permissions?tenant=airqo
```

**Request Body:**

```json
{
  "permissions": ["64a7b8c9d1e2f3a4b5c6d7eb", "64a7b8c9d1e2f3a4b5c6d7ec"]
}
```

#### Update Role Permissions (Replace All)

```http
PUT /roles/64a7b8c9d1e2f3a4b5c6d7ed/permissions?tenant=airqo
```

#### Remove Permission from Role

```http
DELETE /roles/64a7b8c9d1e2f3a4b5c6d7ed/permissions/64a7b8c9d1e2f3a4b5c6d7eb?tenant=airqo
```

---

## User Role Assignment

### Assign User to Role

Assign a role to a user within an organization.

```http
POST /roles/64a7b8c9d1e2f3a4b5c6d7ed/user?tenant=airqo
```

**Request Body:**

```json
{
  "user": "64a7b8c9d1e2f3a4b5c6d7ee"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User successfully assigned to MAKERERE_TECHNICIAN role",
  "operation": "assign_role",
  "role_info": {
    "role_id": "64a7b8c9d1e2f3a4b5c6d7ed",
    "role_name": "MAKERERE_TECHNICIAN",
    "role_type": "group",
    "associated_id": "64a7b8c9d1e2f3a4b5c6d7ea"
  },
  "before_assignment": {
    "user_id": "64a7b8c9d1e2f3a4b5c6d7ee",
    "group_roles": {
      "count": 0,
      "limit": 6,
      "remaining": 6,
      "roles": []
    }
  },
  "after_assignment": {
    "user_id": "64a7b8c9d1e2f3a4b5c6d7ee",
    "group_roles": {
      "count": 1,
      "limit": 6,
      "remaining": 5,
      "roles": [
        {
          "role_id": "64a7b8c9d1e2f3a4b5c6d7ed",
          "role_name": "MAKERERE_TECHNICIAN",
          "group_id": "64a7b8c9d1e2f3a4b5c6d7ea",
          "group_name": "Makerere",
          "userType": "guest",
          "createdAt": "2025-06-05T10:30:00.000Z"
        }
      ]
    }
  }
}
```

### Assign Multiple Users to Role

```http
POST /roles/64a7b8c9d1e2f3a4b5c6d7ed/users?tenant=airqo
```

**Request Body:**

```json
{
  "user_ids": ["64a7b8c9d1e2f3a4b5c6d7ee", "64a7b8c9d1e2f3a4b5c6d7ef"]
}
```

### Unassign User from Role

```http
DELETE /roles/64a7b8c9d1e2f3a4b5c6d7ed/user/64a7b8c9d1e2f3a4b5c6d7ee?tenant=airqo
```

### List Users with Role

```http
GET /roles/64a7b8c9d1e2f3a4b5c6d7ed/users?tenant=airqo
```

### List Available Users for Role

```http
GET /roles/64a7b8c9d1e2f3a4b5c6d7ed/available_users?tenant=airqo
```

### Get User Role Summary

Get comprehensive role information for a user.

```http
GET /roles/users/64a7b8c9d1e2f3a4b5c6d7ee/role-summary?tenant=airqo
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved user role summary",
  "user_role_summary": {
    "user_id": "64a7b8c9d1e2f3a4b5c6d7ee",
    "network_roles": {
      "count": 0,
      "limit": 6,
      "remaining": 6,
      "roles": []
    },
    "group_roles": {
      "count": 1,
      "limit": 6,
      "remaining": 5,
      "roles": [
        {
          "role_id": "64a7b8c9d1e2f3a4b5c6d7ed",
          "role_name": "MAKERERE_TECHNICIAN",
          "group_id": "64a7b8c9d1e2f3a4b5c6d7ea",
          "group_name": "Makerere",
          "userType": "guest"
        }
      ]
    },
    "total_roles": 1
  }
}
```

### Get User Network Roles Only

```http
GET /roles/users/64a7b8c9d1e2f3a4b5c6d7ee/network-roles?tenant=airqo
```

### Get User Group Roles Only

```http
GET /roles/users/64a7b8c9d1e2f3a4b5c6d7ee/group-roles?tenant=airqo
```

---

## Group/Organization Management

### List Groups

```http
GET /groups?tenant=airqo
```

### Create Group

```http
POST /groups?tenant=airqo
```

**Request Body:**

```json
{
  "grp_title": "Makerere Air Lab",
  "grp_description": "Makerere University Air Quality Laboratory",
  "organization_slug": "makerere-air-lab"
}
```

### List Roles for Group

```http
GET /groups/64a7b8c9d1e2f3a4b5c6d7ea/roles?tenant=airqo
```

### Assign User to Group

```http
PUT /groups/64a7b8c9d1e2f3a4b5c6d7ea/assign-user/64a7b8c9d1e2f3a4b5c6d7ee?tenant=airqo
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": "Specific error message",
    "message": "General error message"
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

### RBAC-Specific Errors

#### Permission Denied

```json
{
  "success": false,
  "message": "Access denied: Insufficient permissions",
  "errors": {
    "message": "You don't have the required permissions to access this resource",
    "required": ["USER_MANAGEMENT", "ROLE_ASSIGNMENT"],
    "userPermissions": ["USER_VIEW", "GROUP_VIEW"],
    "requiresAll": false
  }
}
```

#### Role Assignment Limit Exceeded

```json
{
  "success": false,
  "message": "Cannot assign group role. User has reached the maximum limit of 6 group roles.",
  "errors": {
    "current_state": {
      "role_type": "group",
      "current_count": 6,
      "limit": 6,
      "remaining": 0,
      "existing_roles": [...]
    }
  }
}
```

#### Duplicate Role Error

```json
{
  "success": false,
  "message": "Validation errors for some of the provided fields",
  "errors": {
    "role_code": "the role_code must be unique",
    "message": "Role with role_code 'MAKERERE_ADMIN' already exists"
  }
}
```

---

## Frontend Integration Guide

### Authentication Check

Before making RBAC API calls, ensure user is authenticated:

```javascript
// Check if user has valid JWT token
const token = localStorage.getItem("authToken");
if (!token) {
  // Redirect to login
  window.location.href = "/login";
}
```

### Permission-Based UI Rendering

```javascript
// Example: Conditional rendering based on permissions
const UserManagementComponent = () => {
  const [userPermissions, setUserPermissions] = useState([]);
  const [canManageUsers, setCanManageUsers] = useState(false);

  useEffect(() => {
    // Get user permissions from API or JWT token
    fetchUserPermissions().then((permissions) => {
      setUserPermissions(permissions);
      setCanManageUsers(
        permissions.includes("USER_MANAGEMENT") ||
          permissions.includes("SUPER_ADMIN")
      );
    });
  }, []);

  return (
    <div>
      {canManageUsers && <button onClick={createUser}>Create User</button>}
      {userPermissions.includes("USER_VIEW") && <UserList />}
    </div>
  );
};
```

### API Client with RBAC

```javascript
class RBACApiClient {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
    this.headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Get user permissions
  async getUserPermissions(userId) {
    const response = await fetch(
      `${this.baseURL}/roles/users/${userId}/role-summary`,
      { headers: this.headers }
    );
    return response.json();
  }

  // Check if user has specific permission
  async hasPermission(permission, contextId = null, contextType = "group") {
    const userSummary = await this.getUserPermissions("current");
    // Implement permission checking logic
    return userSummary.data.some((role) =>
      role.permissions.includes(permission)
    );
  }

  // Assign role to user
  async assignUserToRole(roleId, userId) {
    const response = await fetch(`${this.baseURL}/roles/${roleId}/user`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ user: userId }),
    });
    return response.json();
  }

  // Get RBAC system health
  async getRBACHealth() {
    const response = await fetch(`${this.baseURL}/admin/rbac-health`, {
      headers: this.headers,
    });
    return response.json();
  }
}
```

### React Hook for RBAC

```javascript
// Custom hook for RBAC functionality
const useRBAC = () => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasPermission = useCallback(
    (permission, contextId = null) => {
      // Implementation depends on your permission structure
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasRole = useCallback(
    (roleName, contextId = null) => {
      return roles.some(
        (role) =>
          role.role_name.includes(roleName) &&
          (!contextId || role.group_id === contextId)
      );
    },
    [roles]
  );

  const canAccessResource = useCallback(
    (requiredPermissions, requireAll = false) => {
      if (requireAll) {
        return requiredPermissions.every((perm) => hasPermission(perm));
      }
      return requiredPermissions.some((perm) => hasPermission(perm));
    },
    [hasPermission]
  );

  useEffect(() => {
    // Fetch user permissions and roles on mount
    fetchUserRBAC().then((data) => {
      setPermissions(data.permissions);
      setRoles(data.roles);
      setLoading(false);
    });
  }, []);

  return {
    permissions,
    roles,
    loading,
    hasPermission,
    hasRole,
    canAccessResource,
  };
};

// Usage in component
const MyComponent = () => {
  const { hasPermission, canAccessResource, loading } = useRBAC();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {hasPermission("USER_CREATE") && <CreateUserButton />}
      {canAccessResource(["ANALYTICS_VIEW", "DASHBOARD_VIEW"]) && (
        <AnalyticsDashboard />
      )}
    </div>
  );
};
```

### Error Handling in Frontend

```javascript
// Centralized error handling for RBAC
const handleRBACError = (error) => {
  switch (error.status) {
    case 401:
      // Redirect to login
      window.location.href = "/login";
      break;
    case 403:
      // Show permission denied message
      showNotification(
        "You don't have permission to perform this action",
        "error"
      );
      break;
    case 409:
      // Handle duplicate/conflict errors
      if (error.errors?.role_code) {
        showNotification("Role with this name already exists", "warning");
      }
      break;
    default:
      showNotification("An unexpected error occurred", "error");
  }
};

// API call with error handling
const createRole = async (roleData) => {
  try {
    const response = await fetch("/api/v2/users/roles", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roleData),
    });

    const result = await response.json();

    if (!result.success) {
      handleRBACError({ status: response.status, ...result });
      return;
    }

    return result;
  } catch (error) {
    handleRBACError({ status: 500, message: error.message });
  }
};
```

---

## Common Patterns

### 1. Organization Onboarding Flow

```javascript
// 1. Create organization request
const orgRequest = await apiClient.createOrganizationRequest({
  organization_name: "Makerere Air Lab",
  contact_email: "admin@makerere.ac.ug",
});

// 2. Admin approves request (creates group + default roles)
await apiClient.approveOrganizationRequest(orgRequest.id);

// 3. Assign super admin role to organization contact
await apiClient.assignUserToRole("MAKERERE_SUPER_ADMIN_ROLE_ID", "USER_ID");
```

### 2. User Permission Checking Pattern

```javascript
// Check before rendering UI elements
const canManageDevices = await rbac.hasPermission("DEVICE_MANAGEMENT", groupId);
const canViewAnalytics = await rbac.hasPermission("ANALYTICS_VIEW", groupId);

// Check multiple permissions
const canAccessDashboard = await rbac.canAccessResource(
  ["DASHBOARD_VIEW", "GROUP_VIEW"],
  false
); // false = any of these permissions
```

### 3. Role Assignment with Validation

```javascript
// Get user's current role summary
const userSummary = await apiClient.getUserRoleSummary(userId);

// Check if user has space for new role
if (userSummary.group_roles.remaining === 0) {
  showError("User has reached maximum role limit");
  return;
}

// Assign role
const result = await apiClient.assignUserToRole(roleId, userId);
if (result.success) {
  showSuccess("Role assigned successfully");
  // Refresh user data
  refreshUserData();
}
```

### 4. Graceful Degradation

```javascript
// Show different UI based on permission level
const DashboardComponent = () => {
  const { hasPermission } = useRBAC();

  if (hasPermission("ANALYTICS_EXPORT")) {
    return <FullDashboard />; // Full featured
  } else if (hasPermission("ANALYTICS_VIEW")) {
    return <ViewOnlyDashboard />; // View only
  } else if (hasPermission("DASHBOARD_VIEW")) {
    return <BasicDashboard />; // Basic view
  } else {
    return <AccessDeniedMessage />;
  }
};
```

---

## Testing & Development

### Setup Development Environment

1. Ensure RBAC system is initialized:

```bash
GET /api/v2/users/admin/rbac-health
```

2. Setup super admin access:

```bash
POST /api/v2/users/admin/super-admin
{
  "secret": "your-dev-secret",
  "tenant": "airqo"
}
```

3. Test basic permissions:

```bash
GET /api/v2/users/org-requests
# Should work with super admin role
```

### Common Development Tasks

#### Reset RBAC System (Development Only)

```bash
POST /api/v2/users/admin/rbac-reset
{
  "secret": "your-dev-secret",
  "dry_run": false,
  "reset_roles": true
}
```

#### Create Test Organization Roles

```bash
POST /api/v2/users/roles
{
  "role_name": "TEST_ADMIN",
  "role_description": "Test administrator role",
  "group_id": "test-group-id"
}
```

---

This documentation provides comprehensive coverage of the RBAC system for frontend integration. For additional support or questions, refer to the API health endpoints or contact the development team.
