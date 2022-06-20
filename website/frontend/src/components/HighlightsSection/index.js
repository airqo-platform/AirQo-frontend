import React, { useState } from 'react'
import FeatureImg from 'assets/img/HighlightsSection/Feature.png'
import TeamImg from 'assets/img/HighlightsSection/AirQoTeam.png'
import Pagination from './pagination';
import Post from './post';

const HighlightsSection = () => {
  const [currentpost, setCurrentPost] = useState(1);
  const paginate = (postNumber) => setCurrentPost(postNumber);
  const totalPosts = 3;

  return (
    <div className='highlights-section'>
      <div className='content'>
        <Post
          postImg={TeamImg}
          tag1={'features'}
          tag2={'event'}
          title={'AirQo at the Sustainability Research & Innovation (SRI) Congress 2022'}
          article_title={'Join Conference'}
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
        />
      </div>
    </div>
  )
}

export default HighlightsSection;