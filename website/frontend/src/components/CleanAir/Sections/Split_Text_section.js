import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

  const [itemsToShow, setItemsToShow] = useState(8);

  const showMoreItems = (setItems, increment) => {
    setItems((prevState) => prevState + increment);
  };

  const showLessItems = (setItems, decrement, minItems) => {
    setItems((prevState) => (prevState > minItems ? prevState - decrement : minItems));
  };

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
      {lists.length > 0 && (
        <div className="container">
          <div className="partners-wrapper">
            <div className="partner-logos">
              <div className="grid-container">
                {lists.slice(0, itemsToShow).map((item) => (
                  <div className="cell" key={item.id} onClick={onLogoClick(item)}>
                    <img className="logo" src={item.partner_logo} alt={item.partner_name} />
                  </div>
                ))}
              </div>
              {itemsToShow < lists.length && (
                <button
                  className="partners-toggle-button"
                  onClick={() => showMoreItems(setItemsToShow, 8)}>
                  {t('cleanAirSite.cta.showMore')}
                </button>
              )}
              {itemsToShow > 8 && (
                <button
                  className="partners-toggle-button"
                  onClick={() => showLessItems(setItemsToShow, 8, 8)}>
                  {t('cleanAirSite.cta.showLess')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Split_Text_section;
