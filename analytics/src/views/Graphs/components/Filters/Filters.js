import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Avatar } from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';

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
        {/*  <div >
              {< form class="form-style-graph" action ="">
                <p>Please enter valid parameters.</p>
                <br/>

                <label for="location"><b>Location:</b></label>
                <input type="search" placeholder="Choose Location" name="location" required/>
                <br/><br/> <br/>

                <label for="start_date"><b>Start Date:</b></label>
                <input type="date" placeholder="Enter Date" name="start_date" />
                
                <label for="time"><b>Start Time :</b></label>
                <input type="time" name="time"/>
                <br/><br/> <br/>

                <label for="end_date"><b>End Date:</b></label>
                <input type="date" placeholder="Enter Date" name="end_date" />
                
                <label for="time"><b>End Time :</b></label>
                <input type="time" name="time"/>
                <br/><br/> <br/>

                <label for="chart type"><b>Chart Type:</b></label>
                <select id="chartTypeSelect">
                  <option>Line</option>
                  <option>Bar</option>
                  <option>Pie</option>
                </select>
                <br/> <br/> <br/>

                <label for="frequency"><b>Frequency:</b></label>
                <select id="frequencySelect" required>
                  <option>Hourly</option>
                  <option>Daily</option>
                </select>
                <br/> <br/> <br/>

                <label for="pollutant"><b>Pollutant:</b></label>
                <select id="pollutantSelect" required>
                  <option>PM 2.5</option>
                  <option>PM 10</option>
                </select>
                <br/> <br/> <br/>

                <div class="wrapper">
                 <button class type="submit">Generate Graph</button>
                </div>
                
                 </form >  }
        </div> */}

<form>
<ul class="form-style-graph">
    <li>
      <label>Location <span class="required">*</span></label><input type="search" name="location" class="" placeholder="location" /> </li>
    <li>
        <label>Start Date</label>
        <input type="date" name="start_date" class="field-divided" /> <input type="time" name="start_time" class="field-divided" />
    </li>

    <li>
        <label>End Date</label>
        <input type="date" name="end_date" class="field-divided" /> <input type="time" name="end_time" class="field-divided" />
    </li>

    <li>
        <label>Chart Type</label>
        <select name="chart_type" class="field-select"> required
        <option value="Line">Line</option>
        <option value="Bar">Bar</option>
        <option value="Bar">Pie</option>
        </select>
    </li>

    <li>
        <label>Frequency</label>
        <select name="frequency" class="field-select" required>
        <option value="Hourly">Hourly</option>
        <option value="Daily">Daily</option>
        <option value="Monthly">Monthly</option>
        </select>
    </li>

    <li>
        <label>Pollutant</label>
        <select name="pollutant" class="field-select" required>
        <option value="PM 2.5">PM 2.5</option>
        <option value="PM 10">PM 10</option>
        </select>
    </li>
    
    <li>
        <input type="submit" value="Generate Graph" />
    </li>
</ul>
</form>
            

      </CardContent>
    </Card>
  );
};

Filters.propTypes = {
  className: PropTypes.string
};

export default Filters;
