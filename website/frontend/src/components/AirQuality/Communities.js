import React, { useState } from 'react'
import AirQualityImg from 'assets/img/ForCommunities.png'

const Communities = () => {
    const [selectedCard, setSelectedCard] = useState('card1')
    const onClickCardItem = (card) => setSelectedCard(card)
  return (
      <>
          <div className='content-container'>
              <div id='first' className={selectedCard === 'card1' ? "card selected" : "card unselected"}
                  name='card1'
                  onClick={() => onClickCardItem('card1')}>
                  <h4>AirQommunity champions</h4>
                  <ol>
                      <li><small>— A growing network of individual change makers </small></li>
                      <li><small>— Championing local leaders and demand action</small></li>
                  </ol>
              </div>
              <div id='second' className={selectedCard === 'card2' ? "card selected" : "card unselected"}
                  name='card2'
                  onClick={() => onClickCardItem('card2')}>
                  <h4>Free access to air quality information</h4>
                  <ol>
                      <li><small>— We train individuals and communities</small></li>
                      <li><small>— Facilitating access to air quality information </small></li>
                  </ol>
              </div>
              <div className={selectedCard === 'card3' ? "card selected" : "card unselected"}
                  name='card3'
                  onClick={() => onClickCardItem('card3')}>
                  <h4>AirQo hosts</h4>
                  <ol>
                      <li><small>— We engage locals host our deployment activities</small></li>
                      <li><small>— We involve locals in our maintainance drives</small></li>
                  </ol>
              </div>
          </div>
          <div className='image'>
              <img src={AirQualityImg} alt='AirQuality image' />
          </div>
      </>
  )
}

export default Communities