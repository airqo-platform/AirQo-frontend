import React from 'react';
import NilePost from 'icons/press/np.svg';

const Article = ({ icon, date, title, subtitle, url }) => (
  <div className="article">
    <div className="a-header">
      {icon === null ? (
        <div className="image">{<NilePost />}</div>
      ) : (
        <img className="image" src={icon} alt="icon" />
      )}
      <span className="date">
        {date
          ? new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : 'February 18, 2022'}
      </span>
    </div>
    <div className="a-body">
      <span className="teaser">
        <p className="article-name">
          {title || 'AirQo partners with KCCA to install air quality monitors in Makindye'}
        </p>
        <p className="first-line">{subtitle}</p>
      </span>
      <a className="a-link" href={url} target="_blank">
        <small>Read article {'->'}</small>
      </a>
    </div>
  </div>
);

export default Article;
