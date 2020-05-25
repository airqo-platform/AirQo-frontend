import React, { useRef } from "react";
import { makeStyles } from "@material-ui/styles";
import { Grid, Card, CardContent, Button } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import Main from "./Main";
import MainTest from "./MainTest";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import PictureAsPdfRoundedIcon from "@material-ui/icons/PictureAsPdfRounded";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  differenceIcon: {
    color: theme.palette.text.secondary,
  },
}));

const ReportTemplate = (props) => {
  const classes = useStyles();
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const { user } = props.auth;
  //console.log(user._id);

  return (
    <div className={classes.root}>
      <Grid container spacing={0}>
        <Grid item lg={12} sm={12} xl={12} xs={12}>
          <Card>
            <CardContent>
              <Tooltip title="Print OR Save As Pdf" placement="right" arrow>
                <Button
                  color="primary"
                  variant="contained"
                  endIcon={<PictureAsPdfRoundedIcon />}
                  onClick={handlePrint}
                  alt="Generate Pdf"
                >
                  {/* Generate Pdf */}
                </Button>
              </Tooltip>
              <Main ref={componentRef} user_id={user._id} />
              {/* <MainTest ref={componentRef} /> */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

ReportTemplate.propTypes = {
  className: PropTypes.string,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(ReportTemplate);
//export default ReportTemplate;
