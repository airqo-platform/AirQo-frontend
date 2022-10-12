import React from 'react'
import ErrorPage from '.'
import DeniedImage from 'src/assets/svg/errors/AccessDenied.svg';

const Error403 = () => {
  return (
    <ErrorPage errorCode={'Error code: 403 Access denied'}>
      <div>
        <DeniedImage />
        <div className="status">
          <b>Access denied</b>
        </div>
        <div className="statement">Hmm, looks like you’re not allowed here.</div>
      </div>
    </ErrorPage>
  );
}

export default Error403