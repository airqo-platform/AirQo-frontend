import React from 'react';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AnalyticsSectionImg from "../../assets/img/analytics-section-img.png";
import PageMini from '../PageMini';
import { useInitScrollTop } from 'utils/customHooks';

const CheckMail = () => {
  useInitScrollTop();
  return (
        <PageMini>
            <div className="GetInvolved">
                <div className="section-left">
                    <div className="content-wrapper">
                        <div className="section-nav">
                            <h5>Home</h5>
                            <ArrowForwardIosIcon className="icon" />
                            <h5 style={{opacity:"0.5"}}>Get Involved</h5>
                        </div>
                        <h1 className="section-title">Check your email to verify your account.</h1>
                        <p className="content">Click the link in the email we just sent to xxx@xxxxxx.com to verify and continue set up of your new AirQo account. If you don’t see an email from AirQo within 15 minutes, please check your spam folder.</p>
                    </div>
                </div>
                <div className="img-section">
                    <img src={AnalyticsSectionImg}/>
                </div>
            </div>
        </PageMini>
  );
};

export default CheckMail;
