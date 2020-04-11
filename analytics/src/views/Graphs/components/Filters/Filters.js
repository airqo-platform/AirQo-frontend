import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import {reduxForm, formReducer, Field} from 'redux-form';


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
  handleFilters = values => {
    console.log(values);
};

/*handleFilters(event){
  //event.preventDefault();
  const data = new FormData(event.target);
  fetch('http://127.0.0.1:5000/api/v1/device/graph', {
    method: 'POST',
    body:data
    //body: JSON.stringify(this.state)
  });
}*/
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
export default withStyles(useStyles)(App);