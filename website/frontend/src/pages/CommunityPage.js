import React from 'react';
import { useInitScrollTop } from 'utils/customHooks';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AirQommunities from 'assets/img/community/AirQommunities.png';
import Blob from 'assets/img/community/AirQo_blob_fill.svg';
import AssetImg1 from 'assets/img/community/Rectangle 406.png';
import AssetImg2 from 'assets/img/community/Rectangle 408-1.png';
import AssetImg3 from 'assets/img/community/Rectangle 409.png';
import CommunityStar from 'assets/img/community/Communities Star.svg';
import AirQoArrowLeft from 'assets/img/community/AirQo_arrow_left.svg';
import AirQoQuotes from 'assets/img/community/AirQo_quotes.png';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Page from './Page';
import SEO from 'utils/seo';

const CommunityPage = () => {
  useInitScrollTop();
  return (
        <Page>
            <div className="CommunityPage">
                <SEO
                    title="Our Solutions"
                    siteTitle="Communities"
                    description="We empower communities across Africa with accurate, hyperlocal, and timely air quality data to drive actions to reduce air pollution."
                />
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
                        <img src={AirQommunities} className="blob-img" />
                    </div>
                    <div className="section-1">
                        <div className="layer-1">
                            <div className="text">
                                <div className="row">
                                    <div className="img-star">
                                        <CommunityStar />
                                    </div>
                                    
                                    <h1>AirQommunity champions</h1>
                                </div>
                                
                                <p>AirQommunity champions and ambassadors are individuals who are part of a growing network of change makers dedicated to improving air quality at the grassroots level.</p>
                                <p>They use air quality data to create positive change in the fight against air inequality while contributing insights and ideas on major issues and potential solutions to air quality challenges in their communities.</p>
                            </div>
                            <div className="img-stack">
                                <div className="stack-1">
                                    <img src={AssetImg1} alt="Image Stock 1" />
                                    <img src={AssetImg2} alt="Image Stock 2" />
                                </div>
                                <img src={AssetImg3} className="stack-2" alt="Image Stock 3" />
                                <div className="layer-2">
                                    <Blob className="blob" style={{ height: '360px' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="strip">
                        <div className="left-strip">
                            <span>
                                <h3>300</h3>
                                <AirQoArrowLeft className="left-strip-arrow" />
                            </span>
                            <h3>AirQocommunity champions</h3>
                        </div>
                        <div className="right-strip">
                            <h3>Gerald has been an air quality community champion for over a year now. <u>Read story</u></h3>
                        </div>
                    </div>

                    <div className="section-1">
                        <div className="layer-1">
                            <div className="text">
                                <h1>Facilitating access to air quality information</h1>
                                <p>Access to air quality data is one of the biggest challenges in tackling air pollution in Africa. We close the air quality data gaps by training and giving free access to real-time data on air quality across Africa, from our open-air quality monitoring platform.</p>
                                <p>Through building and ensuring access to digital platforms that help us know the pattern or behavior of air quality, we are facilitating evidence-based decision-making in air quality.</p>
                            </div>
                            <div className="img-stack">
                                <div className="stack-1">
                                    <img src={AssetImg1} alt="Image Stock 1" />
                                    <img src={AssetImg2} alt="Image Stock 2" />
                                </div>
                                <img src={AssetImg3} className="stack-2" alt="Image Stock 3" />
                                <div className="layer-2">
                                    <Blob className="blob" style={{ height: '360px' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lower-banner">
                        <img src={AirQoQuotes} />
                        <h2>We take air quality monitoring seriously hence our collaboration with AirQo</h2>
                        <h3>Mercy Nasejje</h3>
                        <h6>Health, Safety and Environmental Lead at MOGAS</h6>

                        <button><PlayArrowIcon style={{ marginRight: '10px' }} />Watch video</button>
                    </div>
                </div>

            </div>
        </Page>
  );
};

export default CommunityPage;
