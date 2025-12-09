# Access Control Architecture: Scopes & Contexts

> **Note**: This document supersedes previous "Private Context" documentation. It covers the complete access control model including the shift from Context-based to Scope-based logic.

## Core Concepts

The application uses a **Scope-based Architecture** to decouple *where a user is* (Context) from *how the application behaves* (Scope).

### 1. Context (`userContext`)
Represents the user's current "location" or logical grouping.
- **`personal`**: The default view for any user.
- **`airqo-internal`**: Specific to AirQo staff members.
- **`external-org`**: Specific to users belonging to third-party organizations (e.g., KCCA, NEMA).

### 2. Scope (`userScope`)
Represents the *behavioral mode* of the application. This determines navigation, available features, and data visibility.
- **`personal` Scope**: Focuses on "My Resources". Shows personal devices, user-specific data.
- **`organisation` Scope**: Focuses on "Shared Resources". Shows organization-wide dashboards, all devices in the org, team management.

## The Architecture Shift: Context → Scope Mapping

Crucially, **Context does not 1:1 map to Scope**. We enforce strict scoping rules to ensure consistent user experience:

| Context | Mapped Scope | Behavior Description |
| :--- | :--- | :--- |
| `personal` | `personal` | **"My Workspace"**. User manages their own devices, follows their own sites. |
| `airqo-internal` | **`personal`** | **"My Workspace (Staff Enhanced)"**. AirQo staff now operate in a personal scope. They see "My Devices" but have elevated permissions (via fallback) to manage the platform. |
| `external-org` | `organisation` | **"Organization Dashboard"**. Traditional admin view for external partners to manage their specific entity. |

> **Key Change (v1.15.0)**: Previously, `airqo-internal` was treated similarly to `organisation` scope. Now, it is strictly `personal`. This means AirQo staff do not "administer the AirQo Organization" in the same way an external org admin does; instead, they administrate the *System* from their *Personal Workspace*.

## Permission Resolution Strategy

How we decide if a user can do something (`usePermission` hook) depends on the Scope.

### 1. In `organisation` Scope (External Orgs)
*   **Source**: The `activeGroup` (the organization the user is currently viewing).
*   **Logic**: Standard RBAC. Does the user's role *in this specific group* have the permission?
*   **Example**: A KCCA Admin viewing KCCA dashboard checks KCCA group permissions.

### 2. In `personal` Scope (Private & AirQo Internal)
This uses a layered approach to allow staff to work seamlessly.

*   **Layer 1: Ownership (Implicit)**
    *   Users always have owner-level access to their *own* resources (e.g., `canViewDevices` is always true for own devices).
    
*   **Layer 2: Active Group Assignment (Universal)**
    *   **Problem**: Users in Personal Mode need permissions to access certain features, but traditionally had no active group.
    *   **Solution**: If a user belongs to the **AirQo** group, the system now automatically sets it as their `activeGroup` even when in Personal Mode.
    *   **Result**: Standard permissions work out-of-the-box. An Admin see their admin features because they genuinely have the AirQo group active.

### Implementation Details

#### `userSlice.ts`
Logic defining the active group assignment:
```typescript
if (!action.payload) {
  // Switch to Personal Mode
  // If user belongs to AirQo group, keep it active!
  const airqoGroup = state.userGroups.find((g) => g.grp_title === 'airqo');
  if (airqoGroup) {
     state.activeGroup = airqoGroup;
     // ...
  }
}
```

## Matrix: Who Sees What Where?

| Feature | Personal User (with AirQo Group) | External Org Admin |
| :--- | :--- | :--- |
| **Scope** | `personal` | `organisation` |
| **My Devices** | ✅ Visible | ❌ Hidden |
| **Org Dashboard** | ❌ Hidden | ✅ Visible |
| **Network Mgmt** | ✅ Visible (via AirQo Group) | ❌ Hidden |
| **Site Mgmt** | ✅ Visible (via AirQo Group) | ✅ Visible (Org sites only) |

## Summary
*   **External Users**: Strict isolation. They only see what's in their Org.
*   **AirQo Staff**: Hybrid power. They "live" in a Personal Scope (seeing their own stuff) but "borrow" powers from the AirQo System Group to manage global resources like Networks and Sites.
