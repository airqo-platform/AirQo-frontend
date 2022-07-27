import React from 'react';
import { useInitScrollTop } from 'utils/customHooks';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AirQommunities from 'assets/img/community/AirQommunities.png';
import Blob from 'assets/img/community/AirQo_blob_fill.svg';
import AssetImg1 from 'assets/img/community/Rectangle 411.jpg';
import AssetImg2 from 'assets/img/community/Rectangle 405.jpg';
import AssetImg3 from 'assets/img/community/Rectangle 410.jpg';
import AssetImg6 from 'assets/img/community/Rectangle 408.png';
import TrainingImg1 from 'assets/img/community/AirQo_Web_IMG01.jpg';
import TrainingImg2 from 'assets/img/community/AirQo_Web_IMG10.jpg';
import CommunityStar from 'assets/img/community/Communities Star.svg';
import AirQoArrowLeft from 'assets/img/community/AirQo_arrow_left.svg';
import AirQoQuotes from 'assets/img/community/AirQo_quotes.png';
import Page from '../Page';
import { useDispatch } from "react-redux";
import { showGetInvolvedModal } from "reduxStore/GetInvolved/operations";

const CommunityPage = () => {
    useInitScrollTop();
    const dispatch = useDispatch();
    const showModal = () => dispatch(showGetInvolvedModal(true));
    return (
        <Page>
            <div className="CommunityPage">

                <div className="hero">
                    <div className="header-1">
                        <h6>Solutions</h6>
                        <ArrowForwardIosIcon className="arrow-forward" />
                        <h6>For Communities</h6>
                    </div>
                    <h1 className="header-2">AirQo with Communities</h1>
                    <h3 className="header-3">We harness the value that comes with bringing together community members passionate about clean air and a healthy environment.</h3>
                </div>

                <div className="community_wrapper">
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
                            <h3>AirQommunity champions</h3>
                        </div>
                        <div className="right-strip">
                            <h3>Amina, one of our air quality champions — helping raise awareness about air pollution in her community through our digital technologies. <a href="https://blog.airqo.net/helping-communities-combat-air-pollution-through-digital-technologies-6a5924a1e1e" target="_blank"><u>Read story</u></a></h3>
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
                                    <img src={TrainingImg1} alt="Image Stock 1" />
                                    <img src={TrainingImg2} alt="Image Stock 2" />
                                </div>
                                <img src={AssetImg6} className="stack-2" alt="Image Stock 3" />
                                <div className="layer-2">
                                    <Blob className="blob" style={{ height: '360px' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lower-banner">
                        <img src={AirQoQuotes} />
                        <h2>We advocate for road safety and environmental protection from pollution associated with the transport industry, and depend a lot on the AirQo platform to get air quality data in order to extend air quality education to the communities.</h2>
                        <h3>Michael Wanyama</h3>
                        <h6>Team Lead on AutoSafety</h6>
                    </div>

                    <section className="bottom-hero-section">
                        <h3>Become an air quality champion.</h3>
                        <a href="#" onClick={showModal} className="section-link"><span>Get involved --></span></a>
                    </section>
                </div>

            </div>
        </Page>
  );
};

export default CommunityPage;
