import React from 'react';
import ArrowRight from 'icons/research/arrow-right.svg';
import { FileDownloadOutlined } from '@mui/icons-material';

const ReportComponent = ({ title, authors, link, linkTitle, showSecondAuthor, resourceFile }) => {
  return (
    <div className="report-card">
      <div>
        <div className="main-text">{title}</div>
        <div className="author">Created by</div>
        <div className="team">{authors}</div>
        {showSecondAuthor &&
          <>
            <hr />
            <div className="author">Supported by</div>
            <div className="team">AirQo and Makerere University</div>
          </>
        }
        <div className='resource-links'>
          {link !== null ? (
            <div className="link">
              <a href={link} target="_blank" rel="noopener noreferrer">
                <span>
                  {linkTitle || 'Read More'} <ArrowRight />
                </span>
              </a>
            </div>) : (<span />)
          }
          {resourceFile !== null ? (
            <div className='link'>
              <a href={resourceFile} target="_blank" rel="noopener noreferrer">
                <span>Download <FileDownloadOutlined /> </span>
              </a>
            </div>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportComponent;
