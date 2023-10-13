import React, { useState } from 'react';
import AirQualityImg from 'assets/img/AirQuality.png';

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
  return (
    <>
      <div className="content-container">
        <Accordion
          title="High resolution network"
          selected={selectedCard === 'card1'}
          onClick={() => onClickCardItem('card1')}>
          <li>
            <small>We want cleaner air in all African cities</small>
          </li>
          <li>
            <small>We leverage our understanding of the African context</small>
          </li>
        </Accordion>
        <Accordion
          title="Digital air quality platforms"
          selected={selectedCard === 'card2'}
          onClick={() => onClickCardItem('card2')}>
          <li>
            <small>We empower decision-makers in African cities</small>
          </li>
          <li>
            <small>We increase access to air quality data evidence </small>
          </li>
        </Accordion>
        <Accordion
          title="Policy Engagement"
          selected={selectedCard === 'card3'}
          onClick={() => onClickCardItem('card3')}>
          <li>
            <small>We engage city authorities and government agencies</small>
          </li>
          <li>
            <small>We empower local leaders with air quality information</small>
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
