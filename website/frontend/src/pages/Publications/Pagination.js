import React, { useState, useEffect } from 'react';

const Pagination = ({ itemsPerPage, totalItems, paginate }) => {
  const [pageNumbers, setPageNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(1);

  useEffect(() => {
    const numbers = [];
    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
      numbers.push(i);
    }
    setPageNumbers(numbers);
  }, [itemsPerPage, totalItems]);

  const handleClick = (number) => {
    setCurrentNumber(number);
    paginate(number);
    window.scrollTo(0, 0);
  };

  return (
    <ul className="pagination">
      <li className="page-item">
        <a
          className="page-link"
          onClick={() => {
            currentNumber >= 2 && handleClick(currentNumber - 1);
          }}>
          {'<'}
        </a>
      </li>
      {pageNumbers.map((number) => (
        <li key={number} className={`page-item ${number === currentNumber ? 'active' : ''}`}>
          <a onClick={() => handleClick(number)} className="page-link">
            {number}
          </a>
        </li>
      ))}
      <li className="page-item">
        <a
          className="page-link"
          onClick={() => {
            currentNumber < pageNumbers.length && handleClick(currentNumber + 1);
          }}>
          {'>'}
        </a>
      </li>
    </ul>
  );
};

export default Pagination;
