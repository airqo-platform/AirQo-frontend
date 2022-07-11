import React, { useState } from 'react'
import FeatureImg from 'assets/img/HighlightsSection/Feature.png'
import TeamImg from 'assets/img/HighlightsSection/SRI.jpeg'
import Pagination from './pagination';
import Post from './post';

const HighlightsSection = () => {
  const [currentpost, setCurrentPost] = useState(1);
  const paginate = (postNumber) => setCurrentPost(postNumber);
  const totalPosts = 3;

  const onRightClick =()=>{
    document.getElementsByClassName('content')[0].style.transform = 'translateX(-1018px)';
    document.getElementsByClassName('content')[0].style.display = 'none'
    console.log('right click')
  }

  return (
    <div className='highlights-section'>
      <div className='highlights-container'>
        <div className='content' id='content'>
          <Post
            postImg={TeamImg}
            tag1={'features'}
            tag2={'event'}
            title={'AirQo at the Sustainability Research & Innovation (SRI) Congress 2022'}
            article_title={'Read more'}
            article_link={'https://sri2022.org/about-sri2022/'}
          />
          {
            <Post
              postImg={FeatureImg}
              tag1={'features'}
              tag2={'event'}
              title={'Helping communities combat air pollution through digital technologies'}
              article_title={'Read article'}
            />
          }
        </div>
        <div className='pagination'>
          <Pagination
            paginate={paginate}
            totalPosts={totalPosts}
            postsPerHighlight={totalPosts}
            rightTransition={onRightClick}
          />
        </div>
      </div>
    </div>
  )
}

export default HighlightsSection;