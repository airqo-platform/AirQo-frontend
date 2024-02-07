import React from 'react';
import { FileDownloadOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ReportComponent = ({ title, authors, link, linkTitle, showSecondAuthor, resourceFile }) => {
  const { t } = useTranslation();
  return (
    <div className="report-card">
      <div>
        <div className="main-text">{title}</div>
        <div className="author">Created by</div>
        <div className="team">{authors}</div>
        {showSecondAuthor && (
          <>
            <hr />
            <div className="author">Supported by</div>
            <div className="team">AirQo and Makerere University</div>
          </>
        )}
        <div className="resource-links">
          {link !== null ? (
            <div className="link">
              <a href={link} target="_blank" rel="noopener noreferrer">
                <span>{linkTitle || t('cleanAirSite.publications.card.readmore')}</span>
              </a>
            </div>
          ) : (
            <span />
          )}
          {resourceFile !== null ? (
            <div className="link">
              <a href={resourceFile} target="_blank" rel="noopener noreferrer">
                <span>
                  {t('cleanAirSite.publications.card.download')} <FileDownloadOutlined />{' '}
                </span>
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
