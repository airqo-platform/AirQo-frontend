import React from 'react'
import Triangle from 'icons/loading/airqo.png'

const Loadspinner = () => {
  return (
    <div className='loadspinner'>
      <div className='loader'>
        <img src={Triangle} />
        <div className='bubbles'>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  )
}

export default Loadspinner