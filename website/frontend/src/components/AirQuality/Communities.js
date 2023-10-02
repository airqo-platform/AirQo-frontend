import React, { useState } from 'react';
import AirQualityImg from 'assets/img/ForCommunities.png';

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
  return (
    <>
      <div className="content-container">
        <Accordion
          title="AirQommunity champions"
          selected={selectedCard === 'card1'}
          onClick={() => onClickCardItem('card1')}>
          <li>
            <small>A growing network of individual change makers </small>
          </li>
          <li>
            <small>Championing local leaders and demand action</small>
          </li>
        </Accordion>
        <Accordion
          title="Free access to air quality information"
          selected={selectedCard === 'card2'}
          onClick={() => onClickCardItem('card2')}>
          <li>
            <small>We train individuals and communities</small>
          </li>
          <li>
            <small>Facilitating access to air quality information </small>
          </li>
        </Accordion>
        <Accordion
          title="AirQo hosts"
          selected={selectedCard === 'card3'}
          onClick={() => onClickCardItem('card3')}>
          <li>
            <small>We engage locals host our deployment activities</small>
          </li>
          <li>
            <small>We involve locals in our maintainance drives</small>
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
