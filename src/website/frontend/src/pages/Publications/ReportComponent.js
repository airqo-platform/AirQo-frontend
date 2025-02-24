import React from 'react';
import ArrowRight from 'icons/research/arrow-right.svg';
import { FileDownloadOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ReportComponent = ({ title, authors, link, linkTitle, showSecondAuthor, resourceFile }) => {
  const { t } = useTranslation();
  return (
    <div className="report-card">
      <div>
        <div className="main-text">{title}</div>
        <div className="author">{t('about.publications.reportCard.authors.author1')}</div>
        <div className="team">{authors}</div>
        {showSecondAuthor && (
          <>
            <hr />
            <div className="author">{t('about.publications.reportCard.authors.author2.text')}</div>
            <div className="team">{t('about.publications.reportCard.authors.author2.subText')}</div>
          </>
        )}
        <div className="resource-links">
          {link !== null ? (
            <div className="link">
              <a href={link} target="_blank" rel="noopener noreferrer">
                <span>
                  {linkTitle || t('about.publications.reportCard.resourceLinks.linkText')}{' '}
                  <ArrowRight />
                </span>
              </a>
            </div>
          ) : (
            <span />
          )}
          {resourceFile !== null ? (
            <div className="link">
              <a href={resourceFile} target="_blank" rel="noopener noreferrer">
                <span>
                  {t('about.publications.reportCard.resourceLinks.downloadLinkText')}{' '}
                  <FileDownloadOutlined />{' '}
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
