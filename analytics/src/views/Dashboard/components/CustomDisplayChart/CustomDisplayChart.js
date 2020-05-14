import React from 'react';
import {Line ,Bar, Pie} from 'react-chartjs-2';
import PropTypes from 'prop-types';

const CustomDisplayChart = props => {
  return (
    <article className="canvas-container">
      {(function() {
        
        switch (props.chart_type) {
          case 'line':
            return <Line 
              data={props.customisedGraphData}
              options={props.options}
            /> ;
          case 'bar':
            return <Bar
              data={props.customisedGraphData}          
              options={props.options}
            />;
          case 'pie':
            return  <Pie data={props.customisedGraphData} />;
          default:
            return <Line 
              data={props.customisedGraphData}
              options={props.options}
            /> ;
        }
      })()}
    </article>
  );
}

CustomDisplayChart.propTypes = {
  chart_type: PropTypes.string,
  customisedGraphData: PropTypes.object,
  options: PropTypes.object

};

export default CustomDisplayChart;