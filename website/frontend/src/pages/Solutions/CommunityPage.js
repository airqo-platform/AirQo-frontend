import React from 'react';
import Page from '../Page';
import TopBar from '../../components/nav/TopBar';
import { NewsletterSection } from '../../components/NewsletterSection';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AirQommunityBlob from "assets/img/community/AirQo_blob_full.svg";
import Blob from "assets/img/community/AirQo_blob_fill.svg";
import AssetImg1 from "assets/img/community/Rectangle 406.png";
import AssetImg2 from "assets/img/community/Rectangle 408-1.png";
import AssetImg3 from "assets/img/community/Rectangle 409.png";
import AirQoArrowLeft from "assets/img/community/AirQo_arrow_left.svg";
import AirQoQuotes from "assets/img/community/AirQo_quotes.png";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const CommunityPage = () => (
    <Page>
        <div className="CommunityPage">
            <TopBar />
            
            <div className="hero">
                <div className="header-1">
                    <h6>Solutions</h6>
                    <ArrowForwardIosIcon className="arrow-forward" />
                    <h6>For Communities</h6>
                </div>
                
                <h1 className="header-2">Communities with AirQo</h1>
                <h3 className="header-3">We empower communities across Africa with accurate, hyperlocal, and timely air quality data to drive actions to reduce air pollution.</h3>
            </div>

            <div className="wrapper">
                <div className="blob">
                    <AirQommunityBlob className="blob-img" />
                </div>
                
                <div className="section-1">
                    <div className="layer-1">
                        <div className="text">
                            <h1>AirQommunity champions and AirQo hosts</h1>
                            <p>Recruiting and creating community groups we call AirQommunity. Through these groups, we encourage individuals to share pictures of air pollution practices around their neighbourhoods — information we leverage in building air pollution case studies.</p>
                            <p>Collaboration with locals, locals volunteer to host the installation of air quality monitoring devices at either their places of work or homes. This goes a long way in enforcing the participatory approach in collecting air quality data — involving communities at every step of the journey.</p>
                        </div>
                        <div className="img-stack">
                            <div className="stack-1">
                                <img src={AssetImg1} alt="Image Stock 1" style={{marginBottom: "24px"}}/>
                                <img src={AssetImg2} alt="Image Stock 2" />
                            </div>
                            <img src={AssetImg3} className="stack-2" alt="Image Stock 3" />
                        </div>
                    </div>
                    <div className="layer-2">
                        <Blob className="blob" style={{height:"360px"}} />
                    </div>
                    
                </div>

                <div className="strip">
                    <div className="left-strip">
                        <span>
                            <h3>0113</h3>
                            <img src={AirQoArrowLeft} />
                        </span>
                        <h3>AirQo Hosts</h3>
                    </div>
                    <div className="right-strip">
                        <h3>AirQo Host are individuals we work with to install air quality monitors.</h3>
                    </div>
                </div>

                <div className="section-2">
                    <div className="layer-1">
                        <div className="text">
                            <h1>AirQommunity champions and AirQo hosts</h1>
                            <p>Recruiting and creating community groups we call AirQommunity. Through these groups, we encourage individuals to share pictures of air pollution practices around their neighbourhoods — information we leverage in building air pollution case studies.</p>
                            <p>Collaboration with locals, locals volunteer to host the installation of air quality monitoring devices at either their places of work or homes. This goes a long way in enforcing the participatory approach in collecting air quality data — involving communities at every step of the journey.</p>
                        </div>
                        <div className="img-stack">
                            <div className="stack-1">
                                <img src={AssetImg1} alt="Image Stock 1" />
                                <img src={AssetImg2} alt="Image Stock 2" />
                            </div>
                            <img src={AssetImg3} className="stack-2" alt="Image Stock 3" />
                        </div>
                    </div>
                    <img src={AirQommunityBlob} className="layer-2" />
                </div>

                <div className="lower-banner">
                    <img src={AirQoQuotes} />
                    <h2>We take air quality monitoring seriously hence our collaboration with AirQo</h2>
                    <h3>Mercy Nasejje</h3>
                    <h6>Health, Safety and Environmental Lead at MOGAS</h6>

                    <button><PlayArrowIcon/>Watch video</button>
                </div>
            </div>
            <NewsletterSection />
        </div>
    </Page>
);

export default CommunityPage;
