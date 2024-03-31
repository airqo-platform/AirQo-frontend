import React from 'react';
import Page from 'src/pages/CleanAir/Page';

const CleanAirForumEvent = () => {
  return (
    <Page showNewsLetter={true} showBottomCTAS={false} showSubNav={false}>
      <div className="CleanAirForumEvent">
        <header className="header">
          <div className="header-info-con container">
            <div className="header-info">
              <span>1st July, 2024 - 5th July, 2024</span>
              <span>08:00 - 17:00</span>
              <span>Lagos, Nigeria</span>
            </div>
            <h1>CLEAN Air Forum</h1>
            <h2>Participatory air quality management</h2>
            <div>
              <button className="register-btn">Register here.</button>
            </div>
          </div>

          <nav className="navigation">
            <ul className="container">
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Partners</a>
              </li>
              <li>
                <a href="#">Speakers</a>
              </li>
              <li>
                <a href="#">Schedule</a>
              </li>
              <li>
                <a href="#">Register</a>
              </li>
            </ul>
          </nav>
        </header>
      </div>
    </Page>
  );
};

export default CleanAirForumEvent;
