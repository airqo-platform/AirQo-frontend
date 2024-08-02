import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from '../loaders/Spinner';
import { usePagination, Pagination } from '../pagination/Pagination';

const ITEMS_PER_PAGE = 8;

const Split_Text_section = ({ bgColor, content, title, lists, loading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onLogoClick = (data) => (event) => {
    event.preventDefault();
    if (data.descriptions.length > 0) {
      navigate(`/partners/${data.unique_title}`);
    } else if (data.partner_link) {
      window.open(data.partner_link, '_blank');
    }
  };

  const { currentItems, currentPage, setCurrentPage, totalPages } =
    usePagination(lists, ITEMS_PER_PAGE);

  return (
    <div className="textSplit-section" style={{ backgroundColor: bgColor }}>
      <div className="container">
        <div className="grid-wrapper">
          <div className="title-section">{title}</div>
          <div className="content-section">
            {/<[a-z][\s\S]*>/i.test(content) ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <div>{content}</div>
            )}
          </div>
        </div>
      </div>
      {loading ? (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            padding: '50px 0',
          }}
        >
          <Spinner />
        </div>
      ) : (
        currentItems.length > 0 && (
          <div className="container">
            <div className="partners-wrapper">
              <div className="partner-logos">
                <div className="grid-container">
                  {currentItems.map((item) => (
                    <div
                      className="cell"
                      key={item.id}
                      onClick={onLogoClick(item)}
                    >
                      <img
                        className="logo"
                        src={item.partner_logo}
                        alt={item.partner_name}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Split_Text_section;
