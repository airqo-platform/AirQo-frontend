import React from 'react';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MonitorImg from 'icons/homepage/monitor.png';
import { Link } from 'react-router-dom';
import PageMini from '../PageMini';
import { useInitScrollTop } from 'utils/customHooks';

const GetInvolved = () => {
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
                        <h1 className="section-title">How would you like to engage with us?</h1>
                        <p className="content">Access real-time and historic air quality information across Africa through our easy-to-use air quality analytics dashboard</p>
                    </div>
                </div>
                <div className="section-right">
                    <div className="wrapper">
                        <div className="card-item">
                            <img src={MonitorImg} />
                            <p>I’m a <b>Partner</b>, Interested in supporting AirQo’s vision</p>
                        </div>
                        <div className="card-item">
                            <img src={MonitorImg} />
                            <p>I’m a <b>Researcher</b>, Interested in Air Quality data and analytics</p>
                        </div>
                        <div className="card-item">
                            <img src={MonitorImg} />
                            <p>I’m a <b>Business</b>, Interested in AirQo Products and Services</p>
                        </div>
                        <div className="card-item">
                            <img src={MonitorImg} />
                            <p>I’m a <b>Collaborator</b>, Interested in environmental activism</p>
                        </div>
                        <Link to="/get-involved/register" className="section-button"><button className="next-btn">Next</button></Link>
                    </div>
                </div>
            </div>
        </PageMini>
  );
};

export default GetInvolved;
