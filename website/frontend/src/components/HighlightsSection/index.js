import React, { useState } from 'react'
import FeatureImg from 'assets/img/HighlightsSection/Feature.png'
import TeamImg from 'assets/img/HighlightsSection/SRI.jpeg'
import FortPortal from 'assets/img/HighlightsSection/FortPortal.jpeg'
import Pagination from './pagination';
import Post from './post';

const HighlightsSection = () => {
  const [currentpost, setCurrentPost] = useState(1);
  const totalPosts = 3;
  const paginateRight = (postNumber) => { postNumber < totalPosts ? setCurrentPost(postNumber + 1) : setCurrentPost(postNumber) };
  const paginateLeft = (postNumber) => { postNumber > 1 && postNumber <= totalPosts ? setCurrentPost(postNumber - 1) : setCurrentPost(postNumber) };

  const onRightClick = (e) => {
    paginateRight(currentpost);
    const slider = document.getElementById('content');
    e && currentpost === 1 ? slider.style.transform = 'translateX(-1018px)' : slider.style.transform = 'translateX(-2036px)';
  }

  const onLeftClick = (e) => {
    paginateLeft(currentpost);
    const slider = document.getElementById('content');
    e && currentpost === 3 ? slider.style.transform = 'translateX(-1018px)' : slider.style.transform = 'translateX(0px)';
  }

  return (
    <div className='highlights-section'>
      <div className='highlights-container'>
        <div className='content' id='content'>
          <Post
            postImg={TeamImg}
            tag1={'conference'}
            tag2={'event'}
            title={'AirQo at the Sustainability Research & Innovation (SRI) Congress 2022'}
            article_title={'Read article'}
            article_link={'https://medium.com/@airqo.engineering/airqo-at-the-sustainability-research-innovation-sri-congress-2022-95322ddc2f7'}
          />
          {
            <Post
              postImg={FeatureImg}
              tag1={'articles'}
              tag2={'Community'}
              title={'Helping communities combat air pollution through digital technologies'}
              article_title={'Read article'}
              article_link={'https://blog.airqo.net/helping-communities-combat-air-pollution-through-digital-technologies-6a5924a1e1e'}
            />
          }
          {
            <Post
              postImg={FortPortal}
              tag1={'features'}
              tag2={'event'}
              title={'Fort Portal City receives an air quality monitoring network'}
              article_title={'Read article'}
              article_link={'https://blog.airqo.net/fort-portal-city-receives-an-air-quality-monitoring-network-b04d683efb14'}
            />
          }
        </div>
        <div className='pagination'>
          <Pagination
            totalPosts={totalPosts}
            number={currentpost}
            rightTransition={onRightClick}
            leftTransition={onLeftClick}
          />
        </div>
      </div>
    </div>
  )
}

export default HighlightsSection;