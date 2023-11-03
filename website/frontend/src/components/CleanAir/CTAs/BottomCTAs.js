import React from 'react';
import { Link } from 'react-router-dom';

const BottomCTAs = () => {
  return (
    <div className="Highlight" style={{ minHeight: '0px' }}>
      <div className="highlight-sub">
        <div className="content-wrapper blue-bg">
          <div className="title white-color">
            Increase the visibility of your work in African Cities. Access a pool of experts.
          </div>
          <div className="link white-color">
            <Link
              to="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
              target="_blank"
              rel="noopener noreferrer">
              <span>Join the Network {'-->'}</span>
            </Link>
          </div>
        </div>
        <div className="content-wrapper light-blue-bg">
          <div className="title blue-color">
            Are you organising an event/activity and you would want it featured?
          </div>
          <Link
            to="https://docs.google.com/forms/d/14jKDs2uCtMy2a_hzyCiJnu9i0GbxITX_DJxVB4GGP5c/edit"
            target="_blank"
            rel="noopener noreferrer">
            <div className="link blue-color">Register here {'-->'}</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomCTAs;
