import React from "react";
import MaterialTable from "material-table";

export default function Users() {
  return (
    <MaterialTable
      title="Users"
      columns={[
        { title: "First Name", field: "firstName" },
        { title: "Surname", field: "surname" },
        { title: "Email", field: "email", type: "email" },
        {
          title: "Organization",
          field: "org",
        },
        {
          title: "Category",
          field: "category",
          lookup: {
            30: "school",
            63: "media",
            45: "institution",
            12: "university",
            23: "private",
            34: "host",
          },
        },
      ]}
      data={[
        {
          firstName: "Marvin",
          surname: "Cool",
          email: "t@t.com",
          org: "Airtel",
        },
        {
          firstName: "Joel",
          surname: "Smooth",
          email: "m@m.com",
          org: "KCCA",
        },
      ]}
      actions={[
        {
          icon: "add",
          tooltip: "Add User",
          isFreeAction: true,
          onClick: (event) => alert("You want to add a new user?"),
        },
        {
          icon: "save",
          tooltip: "Approve User",
          onClick: (event, rowData) =>
            window.confirm("You want to approve " + rowData.firstName + "?"),
        },
        (rowData) => ({
          icon: "delete",
          tooltip: "Delete User",
          onClick: (event, rowData) =>
            window.confirm("You want to delete " + rowData.firstName + "?"),
          // disabled: rowData.birthYear < 2000,
        }),
      ]}
      options={{
        actionsColumnIndex: -1,
      }}
    />
  );
}
