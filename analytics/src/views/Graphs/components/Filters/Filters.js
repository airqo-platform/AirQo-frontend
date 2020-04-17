import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import {reduxForm, Field} from 'redux-form';
import { createStore, combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import classnames from "classnames";
import { connect } from "react-redux";


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
   // backgroundColor: theme.palette.success.main,
    height: 56,
    width: 56
  },
  icon: {
    height: 32,
    width: 32
  },
  difference: {
    //marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center'
  },
  differenceIcon: {
    //color: theme.palette.success.dark
  },
  differenceValue: {
    //color: theme.palette.success.dark,
    //marginRight: theme.spacing(1)
  }
}));

class Filters extends Component {
  constructor() {
    super();
    this.state = {
      location: "",
      start_date: "",
      start_time: "",
      end_date: "",
      end_time: "",
      chart_type: "",
      frequency: "",
      pollutant: "",
      errors: {}
    };
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };
  onSubmit = e => {
    e.preventDefault();
    const newGraph = {
      location: this.state.location,
      start_date: this.state.start_date,
      start_time: this.state.start_time,
      end_date: this.state.end_date,
      end_time: this.state.end_time,
      chart_type: this.state.chart_type,
      frequency: this.state.frequency,
      pollutant: this.state.pollutant
    };
    //console.log(newGraph);
    const url = 'http://127.0.0.1:5000/api/v1/device/graph'
    //const data = new FormData(e.target);
  
    var data = new FormData(e.target);
    for (var [key, value] of data.entries()) { 
      console.log(key, value);
     }
    fetch(url, {
      method: 'POST',
      //body: data
      body: JSON.stringify(this.state)
    });
  };

  /*handleFilters(event){
    //event.preventDefault();
    const data = new FormData(event.target);
    fetch(url, {
      method: 'POST',
      body:data
      //body: JSON.stringify(this.state)
    });
  }*/
  render() {
    const { errors } = this.state;
    return (
      <div className="container">
        <div className="row">
          <div className="col s8 offset-s2">
            <form noValidate onSubmit={this.onSubmit}>
            <ul class="form-style-graph">

              <li>
              <div className="input-field col s12">
              <label htmlFor="location">Location</label>
              <input onChange={this.onChange} value={this.state.location} error={errors.location} id="location" type="search"
                  className={classnames("", {
                    invalid: errors.location
                  })} />
              <span className="red-text">{errors.location}</span>
              </div> </li> <br/>

              <li>
              <div className="input-field col s12">
                <label htmlFor="start_time">Start Date</label>
                <input class="field-divided" onChange={this.onChange} value={this.state.start_date} error={errors.start_date} id="start_date" type="date"
                  className={classnames("", {
                    invalid: errors.start_date
                  })} />
                <span className="red-text">{errors.start_date}</span>
                <input class="field-divided" onChange={this.onChange} value={this.state.start_time} error={errors.start_time} id="start_time"
                  type="time"
                  className={classnames("", {
                    invalid: errors.start_time
                  })} />
                  <span className="red-text">{errors.start_time}</span>
              </div> </li> <br/>

              <li>
              <div className="input-field col s12">
                <label htmlFor="end_date">End Date</label>
                <input class="field-divided" onChange={this.onChange} value={this.state.end_date} error={errors.end_date} id="end_date" type="date"
                  className={classnames("", {
                    invalid: errors.end_date
                  })}/>
                <span className="red-text">{errors.end_date}</span>
                <input class="field-divided" onChange={this.onChange} value={this.state.end_time} error={errors.end_time} id="end_time" type="time"
                  className={classnames("", {
                    invalid: errors.end_time
                  })}/>
                <span className="red-text">{errors.end_time}</span>
              </div></li> <br/>

              <li>
              <div className="control">
              <label htmlFor="chart_type">Chart Type</label>
              <select onChange = {this.onChange} value={this.state.chart_type}  id="chart_type" type="chart_type" class="field-select">
                 <option value="bar graph">Bar Graph</option>
                 <option value="line graph">Line Graph</option>
                 <option value="pie chart">Pie Chart</option>
                </select>
                <span className="red-text">{errors.chart_type}</span>
              </div></li> <br/>

              <li>
              <div className="control">
              <label htmlFor="frequency">Frequency</label>
              <select onChange = {this.onChange} value={this.state.frequency}  id="frequency" type="frequency" class="field-select">
                 <option value="hourly">Hourly</option>
                 <option value="daily">Daily</option>
              </select>
                <span className="red-text">{errors.frequency}</span>
              </div></li> <br/>

              <li>
              <div className="control">
              <label htmlFor="pollutant">Pollutant</label>
              <select onChange = {this.onChange} value={this.state.pollutant}  id="pollutant" type="pollutant" class="field-select">
                 <option value="pm10">PM 10</option>
                 <option value="pm2_5">PM 2.5</option>
              </select>
                <span className="red-text">{errors.pollutant}</span>
              </div></li> <br/>
              <div>
              </div>
              <div className="col s12" style={{ paddingLeft: "11.250px" }}>
                <button
                  style={{
                    width: "150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem"
                  }}
                  type="submit"
                  class = "field-button"
                  value ="generate_graph"
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Generate Graph
                </button>
              </div>
              </ul>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

Filters.propTypes = {
  className: PropTypes.string,
  errors: PropTypes.string.isRequired
};

//get our state from Redux and map it to Props to use inside components.
const mapStateToProps = state => ({
  errors: state.errors
});

export default connect(mapStateToProps)(Filters);


/*

const rootReducer = combineReducers({
  form: formReducer
})

const store = createStore(rootReducer)

let FiltersForm = props => {
  const classes = useStyles();
  const { handleSubmit } = props
  return (
    <form onSubmit={handleSubmit}>
      <ul class="form-style-graph">

<li>
  <div >
    <label className="label">Location</label>
    <div class="">
    <Field className="input" name="location" component="input" type ="input" placeholder="location" />
    </div>
  </div>
</li>
<br/>

<li className="field">
  <div className="control">
    <label className="label">Start Date</label>
    <Field class="field-divided" name="start_date" component="input" type="date" placeholder="Start Date"/>
    <Field class="field-divided" name="start_time" component="input" type="time" placeholder="Start Time"/>
  </div>
</li>
<br/>

<li className="field">
  <div className="control">
    <label className="label">End Date</label>
    <Field class="field-divided" name="end_date" component="input" type="date" placeholder="End Date"/>
    <Field class="field-divided" name="end_time" component="input" type="time" placeholder="End Time"/>
  </div>
</li>
<br/>

<li>
  <div >
    <label className="label">Chart Type</label>
    <div className="select">
    <Field class="field-select" name="chart_type" component="select">
      <option />
        <option value="line graph">Line Graph</option>
        <option value="bar graph">Bar Graph</option>
        <option value="pie chart">Pie Chart</option>
    </Field>
    </div>
  </div>
</li>
<br/>

<li>
  <div >
    <label className="label">Frequency</label>
    <div className="select">
    <Field class="field-select" name="frequency" component="select">
      <option />
        <option value="hourly">Hourly</option>
        <option value="daily">Daily</option>
    </Field>
    </div>
  </div>
</li>
<br/>

<li>
  <div >
    <label className="label">Pollutant</label>
    <div>
    <Field class="field-select" name="pollutant" component="select">
      <option />
        <option value="pm2_5">PM 2.5</option>
        <option value="pm10">PM 10</option>
    </Field>
    </div>
  </div>
</li>
<br/>

<div>
  <button class ="field-button" type="submit" value =" Generate Graph">Generate Graph</button>
  
</div>
</ul>
    </form>
  )
}

function validate(form) {
  const errors = {};
  if (!form.location) {
    errors.location = "required";
  }

  return errors;
}

FiltersForm = reduxForm({
  // a unique name for the form
  form: 'filters',
  //validate
})(FiltersForm)

//export default ContactForm

export default class Filters extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    //event.preventDefault() ;
    console.log(event)
    //const data = new FormData(event.target);
    var data = new FormData(event.target);
    //console.log(data)
    for (var [key, value] of data.entries()) { 
      console.log(key, value);
     }
    
    fetch('http://127.0.0.1:5000/api/v1/device/graph', {
      method: 'POST',
      //body: data,
      body: JSON.stringify(this.state)
      //body: event
    });
    return false
  }

  /*handleSubmit = values => {
    // print the form values to the console
    console.log(values)
  }
  render() {
    return <FiltersForm onSubmit={this.handleSubmit} />
  }
} */

/*
let FiltersForm = props => {
  const { className, handleSubmit, pristine, reset, submitting, ...rest }  = props;
  //const { className, pristine, reset, submitting, ...rest }  = props;
  const classes = useStyles();

  return <form onSubmit={handleSubmit} className="form">
    <ul class="form-style-graph">

    <li>
      <div >
        <label className="label">Location</label>
        <div class="">
        <Field className="input" name="location" component="input" type ="input" placeholder="location" />
        </div>
      </div>
    </li>
    <br/>
    
    <li className="field">
      <div className="control">
        <label className="label">Start Date</label>
        <Field class="field-divided" name="start_date" component="input" type="date" placeholder="Start Date"/>
        <Field class="field-divided" name="start_time" component="input" type="time" placeholder="Start Time"/>
      </div>
    </li>
    <br/>

    <li className="field">
      <div className="control">
        <label className="label">End Date</label>
        <Field class="field-divided" name="end_date" component="input" type="date" placeholder="End Date"/>
        <Field class="field-divided" name="end_time" component="input" type="time" placeholder="End Time"/>
      </div>
    </li>
    <br/>

    <li>
      <div >
        <label className="label">Chart Type</label>
        <div className="select">
        <Field class="field-select" name="chart_type" component="select">
          <option />
            <option value="line graph">Line Graph</option>
            <option value="bar graph">Bar Graph</option>
            <option value="pie chart">Pie Chart</option>
        </Field>
        </div>
      </div>
    </li>
    <br/>

    <li>
      <div >
        <label className="label">Frequency</label>
        <div className="select">
        <Field class="field-select" name="frequency" component="select">
          <option />
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
        </Field>
        </div>
      </div>
    </li>
    <br/>

    <li>
      <div >
        <label className="label">Pollutant</label>
        <div>
        <Field class="field-select" name="pollutant" component="select">
          <option />
            <option value="pm2_5">PM 2.5</option>
            <option value="pm10">PM 10</option>
        </Field>
        </div>
      </div>
    </li>
    <br/>

    <div>
      <button class ="field-button" type="submit" value =" Generate Graph">Generate Graph</button>
      
    </div>
    </ul>
  </form>;
};

FiltersForm.propTypes = {
  className: PropTypes.string
};

FiltersForm = reduxForm({
  form: 'filters',
})(FiltersForm);


class App extends React.Component{
 /* handleFilters = values => {
    console.log(values);
};

handleFilters(event){
  //event.preventDefault();
  console.log(event)
  const data = new FormData(event.target);
  fetch('http://127.0.0.1:5000/api/v1/device/graph', {
    method: 'POST',
    //body:data
    body: JSON.stringify(this.state)
  });
}
  render(){
    return (
      <card>
        <CardContent>
          <Grid container justify ="space-between">
            <Grid item> 
              <Typography color="textSecondary" gutterBottom variant="body2"> Filters</Typography> 
              <div>
              <FiltersForm  onSubmit={this.handleFilters}/>
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </card>
    );
  }
}


//export default App; 
export default withStyles(useStyles)(App); */