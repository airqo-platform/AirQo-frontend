import React from 'react';
import { FileDownloadOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const CardComponent = ({ title, authors, link, linkTitle, downloadLink }) => {
  const { t } = useTranslation();
  return (
    <div className="card-container article">
      <div className="title">
        <h2>{title}</h2>
      </div>
      <div className="sub-title">{authors} </div>
      <div className="cta-links">
        {link !== null ? (
          <a className="link" href={link} target="_blank" rel="noreferrer noopener">
            <small>
              {linkTitle || t('about.publications.reportCard.resourceLinks.linkText')} {'->'}
            </small>
          </a>
        ) : (
          <span />
        )}
        {downloadLink !== null ? (
          <a className="link" href={downloadLink} target="_blank">
            <small>
              {t('about.publications.reportCard.resourceLinks.downloadLinkText')}
              <FileDownloadOutlined />{' '}
            </small>
          </a>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
};

export default CardComponent;
