import React from 'react'
import ArrowRight from 'icons/research/arrow-right.svg';

const ReportComponent = ({title, authors, link, linkTitle }) => {
  return (
    <div className="report-card">
      <div>
        <div className="main-text">
          {title}
        </div>
        <div className="author">Created by</div>
        <div className="team">{authors}</div>
        <hr/>
        <div className="author">Supported by</div>
        <div className="team">AirQo and Makerere University</div>
        <div>
          <div className="link">
            <a
              href={link}
              target="_blank"
              download
              rel="noopener noreferrer">
              <span>
                {linkTitle || 'Read More'} <ArrowRight />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportComponent