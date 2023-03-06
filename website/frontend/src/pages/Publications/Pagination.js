import React from 'react';
import { Link } from 'react-router-dom';

const Pagination = ({ itemsPerPage, totalItems, paginate }) => {
  const pageNumbers = [];
  const numbers = pageNumbers.length;
  console.log(numbers);

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
    window.scrollTo(0, 0);
  }

  return (
    <ul className="pagination">
      <li className="page-item">
        <a className="page-link">{'<'}</a>
      </li>
      {pageNumbers.map((number, key) => (
        <li className="page-item" key={key}>
          <a onClick={() => paginate(number)} className="page-link page-number">
            {number}
          </a>
        </li>
      ))}
      <li className="page-item">
        <a className="page-link">{'>'}</a>
      </li>
    </ul>
  );
};

export default Pagination;
