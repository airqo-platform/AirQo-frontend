import React from 'react'
import NilePost from 'icons/press/np.svg'
import ArrowRight from '../../icons/common/ArrowRight';

const Article = () => {
  return (
    <div className='article'>
        <div className='a-header'>
            <div className='image'>
                <NilePost />
            </div>
            <span className='date'>February 18, 2022</span>
        </div>
        <div className='a-body'>
            <span className='teaser'>
                <p className='article-name'>AirQo partners with KCCA to install air quality monitors in Makindye</p>
                <p className='first-line'>AirQo partners with KCCA to install air quality monitors in Makindye</p>
            </span>
            <span className='a-link'>
                <small>Read more</small>
                <ArrowRight/>
            </span>
        </div>
    </div>
  )
}

export default Article;