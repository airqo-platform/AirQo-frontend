import React from 'react';
import ArrowRight from 'icons/research/arrow-right.svg';

const ReportComponent = ({ title, authors, link, linkTitle, showSecondAuthor }) => {
  return (
    <div className="report-card">
      <div>
        <div className="main-text">{title}</div>
        <div className="author">Created by</div>
        <div className="team">{authors}</div>
        { showSecondAuthor &&
          <>
            <hr />
            <div className="author">Supported by</div>
            <div className="team">AirQo and Makerere University</div>
          </>
        }
        <div>
          <div className="link">
            <a href={link} target="_blank" rel="noopener noreferrer" download>
              <span>
                {linkTitle || 'Read More'} <ArrowRight />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportComponent;
