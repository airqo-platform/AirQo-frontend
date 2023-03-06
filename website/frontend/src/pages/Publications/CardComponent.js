import React from 'react';

const CardComponent = ({ title, authors, link, linkTitle, downloadLink }) => {
  return (
    <div className="card-container article">
      <div className="title">
        <h2>{title}</h2>
      </div>
      <div className="sub-title">{authors} </div>
      <div className="cta-links">
        <a className="a-link" href={link} target="_blank">
          <small>
            {linkTitle || 'Read More'} {'->'}
          </small>
        </a>
        {downloadLink ? (
          <a className="a-link" href="#" target="_blank">
            <small>Download </small>
          </a>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
};

export default CardComponent;
