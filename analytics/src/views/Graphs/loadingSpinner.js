import React from 'react';
import Loader from 'react-loader-spinner';

    const LoadingSpinner = () => (
      /*<div className ="loader center">
        <i className="fa fa-spinner fa-spin" /> Loading ...
      </div>*/
      <div
      style={{
        width: "100%",
        height: "100",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
      >
        <Loader type="ThreeDots" color="blue" height="100" width="100" />
      </div>
      
    );

export default LoadingSpinner;