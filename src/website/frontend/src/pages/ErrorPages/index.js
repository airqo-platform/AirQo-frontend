import React from 'react';
import AirQo from 'icons/nav/AirQo';
import { Link } from 'react-router-dom';

const ErrorPage = ({children, errorCode}) => {
  return (
    <div className="ErrorPage">
      <div className="TopBar">
        <div className="wrapper">
          <div className="logo">
            <Link to="/">
              <AirQo />
            </Link>
          </div>
        </div>
      </div>
      <div>{children}</div>
      <div className='button'>
        <Link to="/">Return back home</Link>
      </div>
      <div className='error-code'>
        <span>{errorCode}</span>
      </div>
    </div>
  );
}

export default ErrorPage