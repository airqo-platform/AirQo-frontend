import React from 'react';
import { useSelector } from 'react-redux';
import ImageLoader from '../LoadSpinner/ImageLoader';

const Post = ({ postImg, Tags, title, article_link, article_title }) => {
  const tags = useSelector((state) => state.highlightsData.tags);

  return (
    <div className="feature">
      <div className="img-sm">
        <img src={postImg !== null ? postImg : <ImageLoader />} alt="" />
      </div>
      <div className="feature-content">
        <div className="feature-pills">
          {Tags.length > 0 ? (
            Tags.slice(0, 3).map((Tag) => (
              <span key={Tag.id} className="highlights-tag">
                {tags.filter((tag) => tag.id === Tag).map((t) => t.name)}
              </span>
            ))
          ) : (
            <div />
          )}
        </div>
        <h4>{title}</h4>
        <span className="feature-link">
          <a href={article_link} target="_blank">
            {article_title || 'Read Article'} {'-->'}
          </a>
        </span>
      </div>
    </div>
  );
};

export default Post;
