import React from "react";
import GridItem from "../Grid/GridItem.js";
import GridContainer from "../Grid/GridContainer.js";
import CustomTabs from "../CustomTabs/CustomTabs.js";
import TasksWithoutEdits from "../Tasks/TasksWithoutEdits";
import Code from "@material-ui/icons/Share";
import SettingsIcon from "@material-ui/icons/Settings";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import { makeStyles } from "@material-ui/core/styles";

import { config, social } from "../../variables/general";
const useStyles = makeStyles(styles);

export default function Settings() {
  const [state, setState] = React.useState({
    gilad: true,
    jason: false,
    antoine: true,
  });

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const classes = useStyles();

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={6}>
          <CustomTabs
            title="Options:"
            headerColor="primary"
            tabs={[
              {
                tabName: "Config",
                tabIcon: SettingsIcon,
                tabContent: (
                  <TasksWithoutEdits
                    checkedIndexes={[0, 3]}
                    tasksIndexes={[0, 1]}
                    tasks={config}
                  />
                ),
              },
              {
                tabName: "Social",
                tabIcon: Code,
                tabContent: (
                  <TasksWithoutEdits
                    checkedIndexes={[0, 3]}
                    tasksIndexes={[0, 1, 2]}
                    tasks={social}
                  />
                ),
              },
            ]}
          />
        </GridItem>
      </GridContainer>
    </div>
  );
}
