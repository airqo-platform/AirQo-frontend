import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

const ITEMS_PER_PAGE = 8;

const Split_Text_section = ({ bgColor, content, title, lists }) => {
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

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(lists.length / ITEMS_PER_PAGE);

  const currentItems = lists.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="textSplit-section" style={{ backgroundColor: bgColor }}>
      <div className="container">
        <div className="grid-wrapper">
          <div className="title-section">
            <h1>{title}</h1>
          </div>
          <div className="content-section">
            {/<[a-z][\s\S]*>/i.test(content) ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <p>{content}</p>
            )}
          </div>
        </div>
      </div>
      {currentItems.length > 0 && (
        <div className="container">
          <div className="partners-wrapper">
            <div className="partner-logos">
              <div className="grid-container">
                {currentItems.map((item) => (
                  <div className="cell" key={item.id} onClick={onLogoClick(item)}>
                    <img className="logo" src={item.partner_logo} alt={item.partner_name} />
                  </div>
                ))}
              </div>
              {lists.length > ITEMS_PER_PAGE && (
                <div className="events">
                  <div className="event-cards">
                    <div className="pagination">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}>
                        <KeyboardDoubleArrowLeftIcon
                          sx={{ fill: currentPage === 1 ? '#D1D1D1' : '#000' }}
                        />
                      </button>
                      <p>
                        {currentPage} of {totalPages}
                      </p>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}>
                        <KeyboardDoubleArrowRightIcon
                          sx={{ fill: currentPage === totalPages ? '#D1D1D1' : '#000' }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Split_Text_section;
