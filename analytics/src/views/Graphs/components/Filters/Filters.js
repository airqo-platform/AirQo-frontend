import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Avatar } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';
import {TextField} from 'redux-form-material-ui';
import * as actions from 'actions/index';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import FlatButton from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Add from 'material-ui/svg-icons/content/add';
import DatePicker from '@material-ui/pickers/DatePicker';
import SelectField from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TimePicker from 'material-ui/TimePicker';
import PropTypes from 'prop-types';

import { reduxForm, Field } from 'redux-form';



const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  content: {
    alignItems: 'center',
    display: 'flex'
  },
  title: {
    fontWeight: 700
  },
  avatar: {
    backgroundColor: theme.palette.success.main,
    height: 56,
    width: 56
  },
  icon: {
    height: 32,
    width: 32
  },
  difference: {
    marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center'
  },
  differenceIcon: {
    color: theme.palette.success.dark
  },
  differenceValue: {
    color: theme.palette.success.dark,
    marginRight: theme.spacing(1)
  }
}));

const Filters = props => {
  const { className, ...rest } = props;
  const classes = useStyles();
  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent>
        <Grid
          container
          justify="space-between"
        >
          <Grid item>
            <Typography
              className={classes.title}
              color="textSecondary"
              gutterBottom
              variant="body2"
            >
              Filters
            </Typography>
          </Grid>
        </Grid>

        <div>
          <h4>Please enter graph parameters:</h4>
        </div>
        <div>
          <p>Filters Form</p>
          <SignInForm />
        </div>
      </CardContent>
    </Card>
  );
};

export default Filters;

/*class AddChoreForm extends React.Component {
  constructor(props){
    super(props);

    this.state = {
    name: '',
    open: false,
    date: null,
    time: null,
    assigned_to: '',
    value: 1
    }

    this.handleName = this.handleName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDate = this.handleDate.bind(this);
    this.handleTime = this.handleTime.bind(this);
    this.handleClose = this.handleClose.bind(this)
    this.handleAssignment =this.handleAssignment.bind(this)
  };

  handleName(event) {
  this.setState({
      name: event.target.value
    });
  }

  handleTime(event, time){
    this.setState({time: time})
  }
  handleDate(event, date){
    this.setState({date: date})
  }

  handleSubmit(event){
    const newChore = {
      name: this.state.name,
      end_time: this.state.date,
      category: "chore",
      assigned_to: this.state.assigned_to
    }

    this.props.actions.addEvent(newChore)
    this.handleClose()
    this.setState({name: "", end_time: null});
  }

  handleOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  handleAssignment = (event, index, value) => {
    this.setState({assigned_to: value, value: value});
  };

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        type='submit'
        onTouchTap={this.handleSubmit}
      />,
    ];

    return (
      <div>
      <IconButton tooltip="Add Chore" onTouchTap={this.handleOpen}>
        <Add color={"#FFF"}/>
      </IconButton>
      <Dialog
        title="Add a Chore"
        actions={actions}
        modal={true}
        open={this.state.open}>
        <form>
          <TextField hintText="What chore needs to be completed?" value={this.state.name} onChange={this.handleName}/><br/>

          <SelectField
            value={this.state.assigned_to}
            onChange={this.handleAssignment}
            floatingLabelText={"Assign to: "}>
            {this.props.groupMembers.map(function(member) {
              return <MenuItem value={member.id} primaryText={ member.first_name }/>
            })}
          </SelectField><br/>

          <DatePicker onChange={this.handleDate} value ={this.state.date} hintText="Date to be completed by" />
          <TimePicker onChange={this.handleTime} value={this.state.time} hintText="Time to be completed by" />

        </form>
      </Dialog>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch){
  return {actions: bindActionCreators(actions, dispatch)}
}

const componentCreator = connect(null, mapDispatchToProps)
export default componentCreator(AddChoreForm); */


/*
let SignInForm = props => {
  const { handleSubmit } = props;
  return <form onSubmit={handleSubmit} className="form">
    <div className="field">
      <div className="control">
        <label className="label">First Name</label>
        <Field className="input" name="firstName" component="input" type="text" placeholder="First Name"/>
      </div>
    </div>

    <div className="field">
      <div className="control">
        <label className="label">Last Name</label>
        <Field className="input" name="lastName" component="input" type="text" placeholder="Last Name"/>
      </div>
    </div>

    <div className="field">
      <div className="control">
        <label className="label">Email</label>
        <Field className="input" name="email" component="input" type="email" placeholder="Email Address"/>
      </div>
    </div>

    <div className="field">
      <div className="control">
        <label className="label">Proficiency</label>
        <div className="select">
          <Field className="input" name="proficiency" component="select">
            <option />
            <option value="beginner">Beginner Dev</option>
            <option value="intermediate">Intermediate Dev</option>
            <option value="expert">Expert Dev</option>
          </Field>
        </div>
      </div>
    </div>

    <div className="field">
      <div className="control">
        <label className="label">Age</label>
        <Field className="input" name="age" component="input" type="number" placeholder="Age"/>
      </div>
    </div>

    <div className="field">
      <div className="control">
        <label className="checkbox">
          <Field name="saveDetails" id="saveDetails" component="input" type="checkbox"/>
          Save Details
        </label>
      </div>
    </div>

    <div className="field">
      <div className="control">
        <label className="label">Message</label>
        <Field className="textarea" name="message" component="textarea" />
      </div>
    </div>

    <div className="field">
      <div className="control">
        <button className="button is-link">Submit</button>
      </div>
    </div>

  </form>;
};

SignInForm = reduxForm({
  form: 'signIn',
})(SignInForm);

class App extends React.Component{

  handleSignIn = values => {
    console.log(values);
};
  
  render(){
    
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React x redux-form</h1>
        </header>
        <div className="container">
          <p className="App-intro">
            Contact Form
          </p>
          <SignInForm  onSubmit={this.handleSignIn}/>
        </div>
      </div>
    );
  }
}

export default App; */