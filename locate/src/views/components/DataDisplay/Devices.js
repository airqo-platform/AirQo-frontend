import React from "react";
import MaterialTable from "material-table";

export default function DeviceRegistry() {
  const [state, setState] = React.useState({
    columns: [
      { title: "Name", field: "name" },
      { title: "Location", field: "location" },
      {
        title: "Mount Type",
        field: "mountType",
        lookup: { 34: "wall", 63: "pole", 85: "motor bike" },
      },
      {
        title: "mobile",
        field: "mobile",
        lookup: { 35: "true", 64: "false" },
      },
      {
        title: "visibility",
        field: "visibility",
        lookup: { 36: "public", 68: "private" },
      },
      { title: "Distance to Road", field: "distanceToRoad" },
      { title: "Height", field: "height" },
      { title: "description", field: "description" },
    ],
    data: [
      {
        name: "Bwaise-2020-01-15T13:16:43.218Z",
        location: "Bwaise",
        distanceToRoad: 1987,
        mountType: "pole",
        mobile: true,
        visibility: "public",
        height: 23,
        description: "Bwaise second installation",
      },
      {
        name: "Katwe-2020-01-15T13:28:57.113Z",
        location: "Bwaise",
        distanceToRoad: 1987,
        mountType: "pole",
        mobile: true,
        visibility: "public",
        height: 23,
        description: "Katwe third installation",
      },
    ],
  });

  return (
    <MaterialTable
      title="Device Registry"
      columns={state.columns}
      data={state.data}
      editable={{
        onRowAdd: (newData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              setState((prevState) => {
                const data = [...prevState.data];
                data.push(newData);
                return { ...prevState, data };
              });
            }, 600);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              if (oldData) {
                setState((prevState) => {
                  const data = [...prevState.data];
                  data[data.indexOf(oldData)] = newData;
                  return { ...prevState, data };
                });
              }
            }, 600);
          }),
        onRowDelete: (oldData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              setState((prevState) => {
                const data = [...prevState.data];
                data.splice(data.indexOf(oldData), 1);
                return { ...prevState, data };
              });
            }, 600);
          }),
      }}
      options={{
        actionsColumnIndex: -1,
      }}
    />
  );
}
