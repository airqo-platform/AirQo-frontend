# Access Control Architecture: Scopes & Contexts

> **Note**: This document describes the current access control model, focusing on the decoupling of Context and Scope.

## Core Concepts

The application uses a **Scope-based Architecture** to decouple *where a user is* (Context) from *how the application behaves* (Scope).

### 1. Context (`userContext`)
Represents the user's current "location" or logical grouping.
- **`personal`**: The default view for users. This encompasses both "normal" users managing their own devices AND AirQo staff managing the system (via their personal workspace).
- **`external-org`**: Specific to users belonging to third-party organizations (e.g., KCCA, NEMA) when they have explicitly switched to that organization's view.

### 2. Scope (`userScope`)
Represents the *behavioral mode* of the application. This determines navigation, available features, and data visibility.
- **`personal` Scope**: Focuses on "My Resources". Shows personal devices, user-specific data, and for AirQo staff, allows system management.
- **`organisation` Scope**: Focuses on "Shared Resources". Shows organization-wide dashboards, all devices in the org, team management. This is strictly for External Organizations.

## The Model: Context → Scope Mapping

We enforce strict scoping rules to ensure consistent user experience:

| Context | Mapped Scope | Behavior Description |
| :--- | :--- | :--- |
| `personal` | `personal` | **"My Workspace"**. User manages their own devices, follows their own sites. AirQo staff also perform system admin here. |
| `external-org` | `organisation` | **"Organization Dashboard"**. Traditional admin view for external partners to manage their specific entity. |

> **Key Architecture Note**: We previously had an `airqo-internal` context, but this has been deprecated. AirQo group members now operate strictly within the `personal` context. They do not "administer the AirQo Organization" like an external org admin; instead, they administrate the *System* from their *Personal Workspace*.

## Permission Resolution Strategy

How we decide if a user can do something (`usePermission` hook) depends on the Scope.

### 1. In `organisation` Scope (External Orgs)
*   **Source**: The `activeGroup` (the organization the user is currently viewing).
*   **Logic**: Standard RBAC. Does the user's role *in this specific group* have the permission?
*   **Example**: A KCCA Admin viewing KCCA dashboard checks KCCA group permissions.

### 2. In `personal` Scope (Personal Workspace)
This uses a layered approach to allow seamless system management.

*   **Layer 1: Ownership (Implicit)**
    *   Users always have owner-level access to their *own* resources (e.g., `canViewDevices` is always true for own devices).
    
*   **Layer 2: Active Group Assignment (Universal)**
    *   **Problem**: Users in Personal Mode need permissions to access certain features (like Admin tools), but traditionally had no active group.
    *   **Solution**: If a user belongs to the **AirQo** group, the system now automatically sets it as their `activeGroup` even when in Personal Mode.
    *   **Result**: Standard permissions work out-of-the-box. An Admin sees their admin features because they genuinely have the AirQo group active.

### Implementation Details

#### `userSlice.ts`
Logic defining the active group assignment:
```typescript
if (!action.payload) {
  // Personal Mode
  // If user belongs to AirQo group, keep it active!
  const airqoGroup = state.userGroups.find((g) => g.grp_title === 'airqo');
  if (airqoGroup) {
     state.activeGroup = airqoGroup;
     // ...
  }
}
```

## Matrix: Who Sees What Where?

| Feature | AirQo Staff (Personal Context) | External Org Admin (Org Context) |
| :--- | :--- | :--- |
| **Scope** | `personal` | `organisation` |
| **My Devices** | ✅ Visible | ❌ Hidden |
| **Org Dashboard** | ❌ Hidden | ✅ Visible |
| **Network Mgmt** | ✅ Visible (via AirQo Group) | ❌ Hidden |
| **Site Mgmt** | ✅ Visible (via AirQo Group) | ✅ Visible (Org sites only) |

## Summary
*   **External Users**: Strict isolation in `external-org` context. They only see what's in their Org.
*   **AirQo Staff**: Exist in `personal` context. They "live" in a Personal Scope but "borrow" powers from the AirQo System Group to manage global resources like Networks and Sites.
*   **Context Switching**: Available to any user who belongs to multiple organizations.
