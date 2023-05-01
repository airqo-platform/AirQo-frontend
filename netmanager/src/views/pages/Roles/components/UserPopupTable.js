import React from 'react';

const UserPopupTable = ({ users }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email Address</th>
          <th>Permissions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td>{user.email}</td>
            <td>
              {user.role &&
                user.role.role_permissions &&
                user.role.role_permissions.map((permission) => (
                  <>
                    <input type="checkbox" value={permission.permission} /> {permission.permission}
                  </>
                ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserPopupTable;
