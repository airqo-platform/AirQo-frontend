import React from 'react'
import Article from './Article'

const Press = () => {
    return (
        <div className='press-page'>
            <div className='p-header'>
                <div className='content'>
                    <div className='press-top'>
                        <h2>In the Press</h2>
                        <span>
                            Stories about AirQo that we think you'll love
                        </span>
                    </div>
                </div>
            </div>
            <div className='p-body'>
                <div className='content'>
                    <div className='press-cards'>
                        <div className='card'>
                            <Article />
                        </div>
                        <div className='card'>
                            <Article />
                        </div>
                        <div className='card'>
                            <Article />
                        </div>
                        <div className='card'>
                            <Article />
                        </div>
                    </div>
                    <div className='press-cards-lg'>
                        <div className='card-lg'>
                            <Article />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Press