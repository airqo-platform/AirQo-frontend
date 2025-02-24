import React from 'react';
import NilePost from 'icons/press/np.svg';
import { useTranslation } from 'react-i18next';

const Article = ({ icon, date, title, subtitle, url }) => {
  const { t } = useTranslation();
  return (
    <div className="article">
      <div className="a-header">
        {icon === null ? (
          <div className="image-container">
            <span className="image">{<NilePost />}</span>
          </div>
        ) : (
          <div className="image-container">
            <img
              className="image"
              src={icon}
              alt="icon"
              style={{
                background: `url(${icon}),lightgray 50% contain no-repeat`
              }}
            />
          </div>
        )}
        <span className="date">
          {date
            ? new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : '...'}
        </span>
      </div>
      <div className="a-body">
        <span className="teaser">
          <p className="article-name">{title || '...'}</p>
          <p className="first-line">{subtitle}</p>
        </span>
        <a className="a-link" href={url} target="_blank">
          <small>
            {t('about.press.article.btnText')} {'->'}
          </small>
        </a>
      </div>
    </div>
  );
};

export default Article;
