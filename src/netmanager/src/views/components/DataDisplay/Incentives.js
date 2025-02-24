import React from "react";
import GridItem from "../Grid/GridItem.js";
import GridContainer from "../Grid/GridContainer.js";
import CustomTabs from "../CustomTabs/CustomTabs.js";
import Tasks from "../Tasks/Tasks.js";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import { makeStyles } from "@material-ui/core/styles";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import PaymentIcon from "@material-ui/icons/Payment";
import Button from "../../components/CustomButtons/Button";

import { momo, data, config, social } from "../../variables/general";
const useStyles = makeStyles(styles);

export default function Incentives() {
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
        <GridItem xs={12} sm={12} md={12}>
          <CustomTabs
            title="Options:"
            headerColor="primary"
            tabs={[
              {
                tabName: "DATA",
                tabIcon: CloudUploadIcon,
                tabContent: (
                  <Tasks
                    checkedIndexes={[0, 3]}
                    tasksIndexes={[0, 1, 2, 3]}
                    tasks={data}
                  />
                ),
              },
              {
                tabName: "MOMO",
                tabIcon: PaymentIcon,
                tabContent: (
                  <Tasks
                    checkedIndexes={[0]}
                    tasksIndexes={[0, 1]}
                    tasks={momo}
                  />
                ),
              },
            ]}
          />
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem>
          <div className="col s12" style={{ paddingLeft: "100px" }}>
            <Button color="primary">SUBMIT</Button>
          </div>
        </GridItem>
      </GridContainer>
    </div>
  );
}
