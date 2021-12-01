import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { ArrowBackIosRounded, AddCircleOutline } from "@material-ui/icons";
import { Button, Grid, Paper, TextField } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/styles";

const gridItemStyle = {
  padding: "5px",
  margin: "5px 10px",
};

const attributeStyle = {
  margin: "5px 0",
};

const useStyles = makeStyles((theme) => ({
  input: {
    height: 40,
  },
}));

const ReportAttributeForm = () => {
  const classes = useStyles();
  return (
    <div style={{ marginTop: "20px" }}>
      <Grid container spacing={1}>
        <div
          style={{
            width: "100%",
            border: "2px solid grey",
            marginBottom: "20px",
          }}
        />
        <Grid items xs={12} sm={12} style={attributeStyle}>
          <TextField
            id="subtitle"
            label="Subtitle"
            variant="outlined"
            // className={classes.root}
            InputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            // value={siteInfo.name}
            // onChange={handleSiteInfoChange}
            // error={!!errors.name}
            // helperText={errors.name}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={12} style={attributeStyle}>
          <TextField
            id="asset"
            label="Asset"
            variant="outlined"
            InputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            // value={siteInfo.name}
            // onChange={handleSiteInfoChange}
            // error={!!errors.name}
            // helperText={errors.name}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={12} style={attributeStyle}>
          <TextField
            label="Fields"
            variant="outlined"
            InputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            // value={siteInfo.name}
            // onChange={handleSiteInfoChange}
            // error={!!errors.name}
            // helperText={errors.name}
            fullWidth
            required
          />
        </Grid>
        <Grid items xs={12} sm={12} style={attributeStyle}>
          <TextField
            label="Type"
            variant="outlined"
            InputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            // value={siteInfo.name}
            // onChange={handleSiteInfoChange}
            // error={!!errors.name}
            // helperText={errors.name}
            fullWidth
            required
          />
        </Grid>

        <Grid items xs={12} sm={12} style={attributeStyle}>
          <TextField
            label="Filters"
            variant="outlined"
            InputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            // value={siteInfo.name}
            // onChange={handleSiteInfoChange}
            // error={!!errors.name}
            // helperText={errors.name}
            fullWidth
          />
        </Grid>

        <Grid items xs={12} sm={12} style={attributeStyle}>
          <TextField
            label="Group-by Field"
            variant="outlined"
            InputProps={{
              className: classes.input,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            // value={siteInfo.name}
            // onChange={handleSiteInfoChange}
            // error={!!errors.name}
            // helperText={errors.name}
            fullWidth
          />
        </Grid>
      </Grid>
    </div>
  );
};

const AddReport = () => {
  const history = useHistory();
  return (
    <div
      style={{
        width: "96%",
        margin: "20px auto",
      }}
    >
      <Paper
        style={{
          margin: "0 auto",
          minHeight: "400px",
          padding: "20px 20px",
          maxWidth: "1500px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "1.2rem",
            fontWeight: "bold",
            margin: "20px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "5px",
            }}
          >
            <ArrowBackIosRounded
              style={{ color: "#3f51b5", cursor: "pointer" }}
              onClick={() => history.push("/reports")}
            />
          </div>
          Create a report
        </div>
        <Grid container spacing={1}>
          <Grid items xs={12} sm={12} style={gridItemStyle}>
            <TextField
              id="title"
              label="Report Title"
              variant="outlined"
              // value={siteInfo.name}
              // onChange={handleSiteInfoChange}
              // error={!!errors.name}
              // helperText={errors.name}
              fullWidth
              required
            />
          </Grid>
          <Grid items xs={12} sm={12} style={gridItemStyle}>
            <TextField
              id="period"
              label="Period"
              variant="outlined"
              // value={siteInfo.name}
              // onChange={handleSiteInfoChange}
              // error={!!errors.name}
              // helperText={errors.name}
              fullWidth
              required
            />
          </Grid>

          <div
            style={{
              display: "grid",
              margin: "0 auto",
              gridTemplateColumns: "1fr 4fr",
              width: "96%",
              ...gridItemStyle,
            }}
          >
            <span
              style={{
                color: "",
                fontWeight: "bold",
                margin: "0 15px",
                marginTop: "20px",
              }}
            >
              Report Attributes
            </span>
            <div>
              <ReportAttributeForm />
              {/*<ReportAttributeForm />*/}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <Tooltip title={"Add Attribute"} placement={"top"}>
                  <AddCircleOutline style={{ color: "#3f51b5" }} />
                </Tooltip>
              </div>
            </div>
          </div>

          <Grid
            container
            alignItems="flex-end"
            alignContent="flex-end"
            justify="flex-end"
            xs={12}
            style={{ margin: "10px 0" }}
          >
            <Button
              variant="contained"
              // onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              // disabled={weightedBool(manualDisable, isEqual(site, siteInfo))}
              // onClick={handleSubmit}
              style={{ marginLeft: "10px" }}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default AddReport;
