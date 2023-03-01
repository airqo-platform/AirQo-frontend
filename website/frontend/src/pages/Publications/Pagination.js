import React, { useState } from 'react';

const Pagination = ({ itemsPerPage, totalItems, paginate }) => {
  const pageNumbers = [];
  const [clicked, setClicked] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(1);

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
    window.scrollTo(0, 0);
  }

  return (
    <ul className="pagination">
      <li className="page-item">
        <a
          className="page-link"
          onClick={() => {
            currentNumber >= 2 ? paginate(currentNumber-1) : paginate(1);
          }}>
          {'<'}
        </a>
      </li>
      {pageNumbers.map((number, key) => (
        <li className="page-item" key={key}>
          <a
            onClick={() => {
              setCurrentNumber(number);
              setClicked(true);
              paginate(number);
            }}
            className={clicked ? 'page-link page-number' : 'page-link page-number active'}>
            {number}
          </a>
        </li>
      ))}
      <li className="page-item">
        <a className="page-link" onClick={() => {
          currentNumber >= pageNumbers.length ? paginate(pageNumbers.length) : paginate(currentNumber+1);
        }}>
          {'>'}
        </a>
      </li>
    </ul>
  );
};

export default Pagination;
