import React, { useRef } from "react";
import { makeStyles } from "@material-ui/styles";
import { Grid, Card, CardContent, Button } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import Main from "./Main";
import MainTest from "./MainTest";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import PictureAsPdfSharpIcon from "@material-ui/icons/PictureAsPdfSharp";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  differenceIcon: {
    color: theme.palette.text.secondary,
  },
}));

const ReportTemplate = () => {
  const classes = useStyles();
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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
                  endIcon={<PictureAsPdfSharpIcon />}
                  onClick={handlePrint}
                  alt="Generate Pdf"
                >
                  {/* Generate Pdf */}
                </Button>
              </Tooltip>
              <Main ref={componentRef} />
              {/* <MainTest ref={componentRef} /> */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ReportTemplate;
