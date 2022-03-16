import React from 'react'
import Ios from '../../icons/getapp/ios'
import Play from '../../icons/getapp/play'

const GetApp = () => {
    return (
        <div className='container get-app'>
            <div className='back-drop'>
                <div className='get-content'>
                    <div className='get-text'>
                        <h2>Get the App</h2>
                        <span>Discover the quality of the air you are breathing</span>
                    </div>
                    <div className='get-btns'>
                        <a><button className='get-btn get-ios'><i><Ios /></i><div><small>Download on the</small><span>App Store</span></div></button></a>
                        <a><button className='get-btn get-android'><i><Play /></i><div><small>Get it on</small><div className='google-play'><span id="google">Google</span><span id="play">play</span></div></div></button></a>
                    </div>
                </div>
                <div className='get-graphics'></div>
            </div>
        </div>
    )
}

export default GetApp;