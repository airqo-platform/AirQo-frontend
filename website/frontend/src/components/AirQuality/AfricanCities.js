import React, { useState } from 'react';
import AirQualityImg from 'assets/img/AirQuality.png';
import { useTranslation } from 'react-i18next';

const Accordion = ({ children, title, selected, onClick }) => {
  return (
    <div className={selected ? 'card selected' : 'card'} onClick={onClick}>
      <h4>{title}</h4>
      {selected && <ol>{children}</ol>}
    </div>
  );
};

const AfricanCities = () => {
  const [selectedCard, setSelectedCard] = useState('card1');
  const onClickCardItem = (card) => setSelectedCard(card);
  const { t } = useTranslation();
  return (
    <>
      <div className="content-container">
        <Accordion
          title={`${t("homepage.airQuality.cities.first.title")}`}
          selected={selectedCard === 'card1'}
          onClick={() => onClickCardItem('card1')}>
          <li>
            <small>{t("homepage.airQuality.cities.first.list.1")}</small>
          </li>
          <li>
            <small>{t("homepage.airQuality.cities.first.list.2")}</small>
          </li>
        </Accordion>
        <Accordion
          title={`${t("homepage.airQuality.cities.second.title")}`}
          selected={selectedCard === 'card2'}
          onClick={() => onClickCardItem('card2')}>
          <li>
            <small>{t("homepage.airQuality.cities.second.list.1")}</small>
          </li>
          <li>
            <small>{t("homepage.airQuality.cities.second.list.2")} </small>
          </li>
        </Accordion>
        <Accordion
          title={`${t("homepage.airQuality.cities.third.title")}`}
          selected={selectedCard === 'card3'}
          onClick={() => onClickCardItem('card3')}>
          <li>
            <small>{t("homepage.airQuality.cities.third.list.1")}</small>
          </li>
          <li>
            <small>{t("homepage.airQuality.cities.third.list.2")}</small>
          </li>
        </Accordion>
      </div>
      <div className="image">
        <img src={AirQualityImg} alt="AirQuality image" />
      </div>
    </>
  );
};

export default AfricanCities;
