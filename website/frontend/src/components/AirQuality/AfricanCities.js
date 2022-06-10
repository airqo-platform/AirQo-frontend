import React, { useState } from 'react'
import AirQualityImg from 'assets/img/AirQuality.png'
import PlatformImg from 'assets/img/Digitalplatforms.png'

const AfricanCities = () => {
    const [selectedCard, setSelectedCard] = useState('card1')
    const onClickCardItem = (card) => setSelectedCard(card)
    return (
        <>
            <div className='content-container'>
                <div id='first' className={selectedCard === 'card1' ? "card selected" : "card unselected"}
                    name='card1'
                    onClick={() => onClickCardItem('card1')}>
                    <h4>High resolution network</h4>
                    <ol>
                        <li><small>— We want cleaner air in all African cities</small></li>
                        <li><small>— We leverage our understanding of the African context</small></li>
                    </ol>
                </div>
                <div id='second' className={selectedCard === 'card2' ? "card selected" : "card unselected"}
                    name='card2'
                    onClick={() => onClickCardItem('card2')}>
                    <h4>Digital air quality platforms</h4>
                    <ol>
                        <li><small>— We empower decision-makers in African cities</small></li>
                        <li><small>— We increased access to air quality data evidence </small></li>
                    </ol>
                </div>
                <div className={selectedCard === 'card3' ? "card selected" : "card unselected"}
                    name='card3'
                    onClick={() => onClickCardItem('card3')}>
                    <h4>Policy Engagement</h4>
                    <ol>
                        <li><small>— We engage city authorities and government agencies</small></li>
                        <li><small>— We empower local leaders with air quality information</small></li>
                    </ol>
                </div>
            </div>
            <div className='image'>
                <img src={AirQualityImg} alt='AirQuality image' />
            </div>
        </>
    )
}

export default AfricanCities