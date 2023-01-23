import React from 'react'
import ErrorPage from '.'
import OopsImage from 'src/assets/svg/errors/Oops.svg';

const ErrorPageComponent = ({errorCodeText, blueText, mainBlackText, subText, children}) => {
  return (
    <ErrorPage errorCode={errorCodeText}>
      <div>
        <OopsImage />
        <div className="status">
          <b>{blueText}</b>
          <span>{mainBlackText ? mainText : null}</span>
        </div>
        <div className="statement">
          {subText}
          {children}
        </div>
      </div>
    </ErrorPage>
  );
}

export default ErrorPageComponent