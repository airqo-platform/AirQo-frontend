import React from 'react'

const CardComponent = () => {
  return (
    <div className="card-container article">
      <div className="title">
        <h2>
          Air pollution and mobility patterns in two Ugandan cities during COVID-19 mobility
          restrictions suggest the validity of air quality data as a measure for human mobility.
        </h2>
      </div>
      <div className="sub-title">Galiwango, R., Bainomugisha, E., Kivunike, F. et al </div>
      <div className='cta-links'>
        <a className="a-link" href='#' target="_blank">
          <small>Read More {'->'}</small>
        </a>
      </div>
    </div>
  );
}

export default CardComponent