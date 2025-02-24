import React from 'react';

const Pagination = ({ number, totalPosts, leftTransition, rightTransition }) => {
  const postNumbers = [];

  for (let i = 1; i <= totalPosts; i++) {
    postNumbers.push(i);
  }

  return (
    <div>
      <nav className="pagination-nav">
        <ul>
          <li className="post-number">
            <a>
              <span>0{number}</span>
              <span>/</span>
              <span>0{totalPosts}</span>
            </a>
          </li>
          <li id="left" onClick={leftTransition}>
            <a>{'<-'}</a>
          </li>
          <li id="right" onClick={rightTransition}>
            <a>{'->'}</a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
