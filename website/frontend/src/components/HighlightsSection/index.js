import React, { useEffect, useState } from 'react'
import Pagination from './pagination';
import Post from './post';
import { useDispatch } from 'react-redux';
import { useHighlightsData } from '../../../reduxStore/Highlights/selectors';
import { loadHighlightsData } from '../../../reduxStore/Highlights/operations';

const HighlightsSection = () => {
  const dispatch = useDispatch();
  const highlightsData = useHighlightsData();

  const [currentpost, setCurrentPost] = useState(1);
  const totalPosts = highlightsData.length;
  const paginateRight = (postNumber) => { postNumber < totalPosts ? setCurrentPost(postNumber + 1) : setCurrentPost(postNumber) };
  const paginateLeft = (postNumber) => { postNumber > 1 && postNumber <= totalPosts ? setCurrentPost(postNumber - 1) : setCurrentPost(postNumber) };

  const onRightClick = (e) => {
    paginateRight(currentpost);
    const slider = document.getElementById('content');
    const width = slider.clientWidth;
    e && currentpost === 1 ? slider.style.transform = `translateX(${width})` : slider.style.transform = 'translateX(-2036px)';
  }

  const onLeftClick = (e) => {
    paginateLeft(currentpost);
    const slider = document.getElementById('content');
    e && currentpost === 3 ? slider.style.transform = 'translateX(-1018px)' : slider.style.transform = 'translateX(0px)';
  }

  useEffect(() => {
    dispatch(loadHighlightsData);
  },[])
  return (
    <div className='highlights-section'>
      <div className='highlights-container'>
        <div className='content' id='content'>
          {
            highlightsData.length > 0 ? highlightsData.map((highlight) => (
              <Post
                key={highlight.id}
                postImg={highlight.image}
                Tags={highlight.tags}
                title={highlight.title}
                article_title={'Read article'}
                article_link={highlight.link}
              />
            )) :
              <div>
                Upcoming highlights ...
              </div>

          }
        </div>
        {
          highlightsData.length > 0 &&
          <div className='pagination'>
            <Pagination
              totalPosts={totalPosts}
              number={currentpost}
              rightTransition={onRightClick}
              leftTransition={onLeftClick}
            />
          </div>
        }
      </div>
    </div>
  )
}

export default HighlightsSection;