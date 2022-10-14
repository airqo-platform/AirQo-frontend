import React from 'react'
import ErrorPage from '.'
import Error500Image from 'src/assets/svg/errors/InternalServerError.svg';

const Error500 = () => {
  return (
    <ErrorPage errorCode={'Error code: 500 Internal server error'}>
      <div>
        <Error500Image />
        <div className="status">
          <b>Oops!</b>
          <span>Something went wrong</span>
        </div>
        <div className="statement">
          Your request can't be handled at the moment but our team is working to fix that
        </div>
      </div>
    </ErrorPage>
  );
}

export default Error500