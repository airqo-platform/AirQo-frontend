import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import SaveIcon from "@material-ui/icons/Save";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import StarBorder from "@material-ui/icons/StarBorder";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import { withStyles } from "@material-ui/styles";
import PropTypes from "prop-types";
import axios from "axios";

const styles = theme => ({
  nested: {
    paddingLeft: theme.spacing(4)
  },
  root: {
    backgroundColor: theme.palette.background.paper,
    height: "auto"
  }
});

class LocateSave extends React.Component {
  //const classes = useStyles();
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openSave: false,
      openConfirm: false,
      savedPlan: {},
      space_name: ""
    };
    // bind to this
    this.handleClick = this.handleClick.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleSaveClose = this.handleSaveClose.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.handleConfirmClose = this.handleConfirmClose.bind(this);
  }

  componentDidMount() {
    axios
      .get(
        `http://localhost:4000/api/v1/map/getlocatemap/` + this.props.user_id
      )
      .then(res => {
        this.setState({ savedPlan: res.data[0] });
        console.log(this.state);
      })
      .catch(e => {
        console.log(e);
      });
  }

  // save planning space
  savePlanningSpace = () => {
    // head the save planning space dialog
    this.setState(prevState => ({ openSave: !prevState.openSave }));
    // make api call
    axios
      .post(
        `http://localhost:4000/api/v1/map/savelocatemap`,
        {
          user_id: this.props.user_id,
          space_name: this.state.space_name,
          plan: this.props.plan
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then(res => {
        console.log(res);
        this.setState(prevState => ({ openConfirm: !prevState.openConfirm })); //
      })
      .catch(e => console.log(e));
  };
  // This deals with save planing space dialog box
  handleSaveClick = () => {
    this.setState(prevState => ({ openSave: !prevState.openSave }));
  };
  handleSaveClose = () => {
    this.setState(prevState => ({ openSave: !prevState.openSave }));
    //console.log(this.state, this.props.plan, this.props.user_id);
  };
  // hooks the planning space textfield input
  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // Handles saved space confirmation feedback
  handleConfirmClose = () => {
    this.setState(prevState => ({ openConfirm: !prevState.openConfirm }));
  };

  // load previously saved space
  handleClick = () => {
    this.setState(prevState => ({ open: !prevState.open }));
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <List
          component="nav"
          aria-labelledby="nested-list-subheader"
          className={classes.root}
        >
          <ListItem button>
            <ListItemIcon>
              <SaveIcon />
            </ListItemIcon>
            <ListItemText primary="Save" onClick={this.handleSaveClick} />
          </ListItem>
          <ListItem button onClick={this.handleClick}>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Open" />
            {this.state.open ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={this.state.open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button className={classes.nested}>
                <ListItemIcon>
                  <StarBorder />
                </ListItemIcon>
                <ListItemText
                  primary={
                    this.state.savedPlan == null
                      ? ""
                      : this.state.savedPlan.space_name
                  }
                />
              </ListItem>
            </List>
          </Collapse>
        </List>

        {/* Dialog for save locate data */}
        <Dialog
          open={this.state.openSave}
          onClose={this.handleSaveClose}
          aria-labelledby="form-dialog-title"
        >
          {/* <DialogTitle id="form-dialog-title">Save Planning Space</DialogTitle> */}
          <DialogContent>
            <DialogContentText>
              To save this planning space, please enter the name in the text
              field below. Thank you for using AirQo Locate service.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="space_name"
              value={this.state.space_name}
              onChange={this.changeHandler}
              label="Save As"
              type="text"
              placeholder="airqo_locate_plan_001"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleSaveClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.savePlanningSpace} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for confirming saved location data  */}
        <Dialog
          open={this.state.openConfirm}
          onClose={this.handleConfirmClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          {/* <DialogTitle id="alert-dialog-title">
          {"Use Google's location service?"}
        </DialogTitle> */}
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Locate Planning Space has been saved successfully
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleConfirmClose} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
LocateSave.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(LocateSave);