import React from 'react';
import { FileDownloadOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * @description Card component for the publications page
 * @param {String} title
 * @param {String} authors_title
 * @param {String} authors
 * @param {String} link
 * @param {String} linkTitle
 * @param {Boolean} showSecondAuthor
 * @param {String} resourceFile
 * @param {String} resourceCategory
 * @returns {JSX.Element}
 */
const ReportComponent = ({
  title,
  authors_title,
  authors,
  link,
  linkTitle,
  showSecondAuthor,
  resourceFile,
  resourceCategory,
}) => {
  const { t } = useTranslation();
  return (
    <div className="report-card">
      <div className="report-card-body">
        <div className="category-type">{resourceCategory}</div>
        <div className="main-text">{title}</div>
        <div className="author">
          {authors_title || t('about.publications.reportCard.authors.author1')}
        </div>
        <div className="team">{authors}</div>
        {showSecondAuthor && (
          <>
            <hr />
            <div className="author">
              {t('about.publications.reportCard.authors.author2.text')}
            </div>
            <div className="team">
              {t('about.publications.reportCard.authors.author2.subText')}
            </div>
          </>
        )}
        <div className="resource-links">
          {link !== null ? (
            <div className="link">
              <a href={link} target="_blank" rel="noopener noreferrer">
                <span>
                  {linkTitle ||
                    t(
                      'about.publications.reportCard.resourceLinks.linkText'
                    )}{' '}
                  {'-->'}
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
                  {t(
                    'about.publications.reportCard.resourceLinks.downloadLinkText'
                  )}{' '}
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
