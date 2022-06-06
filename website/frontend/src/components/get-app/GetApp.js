import React from 'react';
import GetappImg from 'assets/img/Get-app.png';
import GetappImgSm from 'assets/img/get-app-sm.png';
import AppleStore from 'assets/svg/apple_app_store.svg';
import AndroidStore from 'assets/svg/android_play_store.svg';

const GetApp = () => {
    return (
        <div className='get-app'>
            <div className='back-drop'>
                <div className='get-content'>
                    <div className='get-text'>
                        <h2>Download the app</h2>
                        <span>Discover the quality of the air you are breathing</span>
                    </div>
                    <div className='get-btns'>
                        <button className='get-btn get-ios'>
                            <AppleStore />
                        </button>

                        <button className='get-btn get-android'>
                            <AndroidStore />
                        </button>
                    </div>
                </div>
                <div className='get-graphics'>
                    <div className='get-graphics-lg'>
                        <img src={GetappImg} alt="GetAppImage"/>
                    </div>
                    <img src={GetappImgSm} className="get-graphics-sm" />
                </div>
            </div>
        </div>
    )
}

export default GetApp;