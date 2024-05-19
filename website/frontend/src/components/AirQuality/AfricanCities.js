import React, { useState } from 'react';
import AirQualityImg from 'assets/img/AirQuality.webp';
import { useTranslation } from 'react-i18next';

/**
 * Accordion component
 * @param {Object} props
 */
const Accordion = ({ children, title, selected, onClick }) => (
  <div className={selected ? 'card selected' : 'card'} onClick={onClick}>
    <h4>{title}</h4>
    {selected && <ol>{children}</ol>}
  </div>
);

const AfricanCities = () => {
  const [selectedCard, setSelectedCard] = useState('card1');
  const { t } = useTranslation();

  const accordionData = [
    {
      card: 'card1',
      title: 'homepage.airQuality.cities.first.title',
      list: ['homepage.airQuality.cities.first.list.1', 'homepage.airQuality.cities.first.list.2']
    },
    {
      card: 'card2',
      title: 'homepage.airQuality.cities.second.title',
      list: ['homepage.airQuality.cities.second.list.1', 'homepage.airQuality.cities.second.list.2']
    },
    {
      card: 'card3',
      title: 'homepage.airQuality.cities.third.title',
      list: ['homepage.airQuality.cities.third.list.1', 'homepage.airQuality.cities.third.list.2']
    }
  ];

  return (
    <>
      <div className="content-container">
        {accordionData.map(({ card, title, list }) => (
          <Accordion
            key={card}
            title={t(title)}
            selected={selectedCard === card}
            onClick={() => setSelectedCard(card)}>
            {list.map((item, index) => (
              <li key={index}>
                <small>{t(item)}</small>
              </li>
            ))}
          </Accordion>
        ))}
      </div>
      <div className="image">
        <img src={AirQualityImg} alt="AirQuality image" loading="lazy" />
      </div>
    </>
  );
};

export default AfricanCities;
