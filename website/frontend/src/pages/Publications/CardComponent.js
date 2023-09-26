import React from 'react';
import { FileDownloadOutlined } from '@mui/icons-material';

const CardComponent = ({ title, authors, link, linkTitle, downloadLink }) => {
  return (
    <div className="card-container article">
      <div className="title">
        <h2>{title}</h2>
      </div>
      <div className="sub-title">{authors} </div>
      <div className="cta-links">
        {link !== null ?
          <a className="link" href={link} target="_blank" rel='noreferrer noopener'>
            <small>
              {linkTitle || 'Read More'} {'->'}
            </small>
          </a> : <span />
        }
        {downloadLink !== null ? (
          <a className="link" href={downloadLink} target="_blank">
            <small>Download <FileDownloadOutlined /> </small>
          </a>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
};

export default CardComponent;
