import React from 'react';
import NilePost from 'icons/press/np.svg';

const Article = ({icon, date, title, subtitle, url}) => (
    <div className="article">
        <div className="a-header">
            <div className="image">
                {icon || <NilePost />}
            </div>
            <span className="date">{date || "February 18, 2022"}</span>
        </div>
        <div className="a-body">
            <span className="teaser">
                <p className="article-name">{title || "AirQo partners with KCCA to install air quality monitors in Makindye"}</p>
                <p className="first-line">{subtitle}</p>
            </span>
            <a className="a-link" href={url} target="_blank">
                <small>Read article {'->'}</small>
            </a>
        </div>
    </div>
);

export default Article;
