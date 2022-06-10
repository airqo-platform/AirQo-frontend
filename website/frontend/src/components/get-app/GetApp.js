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
                        <a target="_blank" href="https://apps.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091" className='get-btn get-ios'>
                            <AppleStore />
                        </a>

                        <a target="_blank" href="https://play.google.com/store/apps/details?id=com.airqo.app" className='get-btn get-android'>
                            <AndroidStore />
                        </a>
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