import React from 'react'
import { Link } from 'react-router-dom';

const BottomCTAs = () => {
    return (
        <div className="Highlight" style={{minHeight:'0px'}}>
            <div className="highlight-sub">
                <div className="content-wrapper blue-bg">
                    <div className="title white-color">Increase the visibility of your work in African Cities. Access a pool of experts.
                    </div>
                    <div className="link white-color"><Link to=""><span>Join the Network {'-->'}</span></Link></div>
                </div>
                <div className="content-wrapper light-blue-bg">
                    <div className="title blue-color">Are you organising an event/activity and you would want it featured?</div>
                    <div className="link blue-color">Register here {'-->'}</div>
                </div>
            </div>
        </div>
    )
}

export default BottomCTAs;