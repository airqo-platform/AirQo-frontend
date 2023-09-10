import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Section6 from 'assets/img/cleanAir/section6.png';

const Highlight = () => {
  return (
    <div className="CleanAir-highlights">
      <div className="highlights-wrapper">
        <span className="highlight-image">
          <div className="image-content">
            <span id="first-pill">
              <p>Latest News</p>
            </span>
          </div>
          <img src={Section6} alt={'Community awareness and engagements'} />
        </span>
        <div className="hightlight-content">
          <h1>Community awareness and engagements</h1>
          <p>
            Empowering communities across Africa with accurate, hyperlocal and timely air quality
            data to drive air pollution mitigation actions.
          </p>
          <div className="hightlight-btn">
            <Link to="#" target="_blank">
              <span>Read here {'-->'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Highlight;
