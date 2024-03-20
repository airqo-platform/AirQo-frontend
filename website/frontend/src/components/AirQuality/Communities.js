import React, { useState } from 'react';
import AirQualityImg from 'assets/img/ForCommunities.png';
import { useTranslation } from 'react-i18next';


const Accordion = ({ children, title, selected, onClick }) => {
  return (
    <div className={selected ? 'card selected' : 'card'} onClick={onClick}>
      <h4>{title}</h4>
      {selected && <ol>{children}</ol>}
    </div>
  );
};

const Communities = () => {
  const [selectedCard, setSelectedCard] = useState('card1');
  const onClickCardItem = (card) => setSelectedCard(card);
  const { t } = useTranslation();
  return (
    <>
      <div className="content-container">
        <Accordion
          title={`${t("homepage.airQuality.community.first.title")}`}
          selected={selectedCard === 'card1'}
          onClick={() => onClickCardItem('card1')}>
          <li>
            <small>{t("homepage.airQuality.community.first.list.1")} </small>
          </li>
          <li>
            <small>{t("homepage.airQuality.community.first.list.2")}</small>
          </li>
        </Accordion>
        <Accordion
          title={`${t("homepage.airQuality.community.second.title")}`}
          selected={selectedCard === 'card2'}
          onClick={() => onClickCardItem('card2')}>
          <li>
            <small>{t("homepage.airQuality.community.second.list.1")}</small>
          </li>
          <li>
            <small>{t("homepage.airQuality.community.second.list.2")}</small>
          </li>
        </Accordion>
        <Accordion
          title={`${t("homepage.airQuality.community.third.title")}`}
          selected={selectedCard === 'card3'}
          onClick={() => onClickCardItem('card3')}>
          <li>
            <small>{t("homepage.airQuality.community.third.list.1")}</small>
          </li>
          <li>
            <small>{t("homepage.airQuality.community.third.list.2")}</small>
          </li>
        </Accordion>
      </div>
      <div className="image">
        <img src={AirQualityImg} alt="AirQuality image" />
      </div>
    </>
  );
};

export default Communities;
