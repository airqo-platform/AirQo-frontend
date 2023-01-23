import React from 'react';
import ErrorPage from '.';
import OopsImage from 'src/assets/svg/errors/Oops.svg';

const Error404 = () => {
  return (
    <ErrorPage errorCode={'Error code: 404 Page not found'}>
      <div>
        <OopsImage />
        <div className="status">
          <b>Oops!</b>
          <span>We can't seem to find the page you're looking for.</span>
        </div>
        <div className="statement">
          But, take a deep breath of clean air on us. Ready? <br/>
          <span>Breathe In, Breathe Out</span>
        </div>
      </div>
    </ErrorPage>
  );
};

export default Error404;
