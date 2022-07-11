import React from 'react';
import { useInitScrollTop } from 'utils/customHooks';
import Page from './Page';


const JobListing = ({title, type}) => {
    return (
        <div className="listing">
            <span className="title">{title}</span>
            <span className="type">{type}</span>
            <span className="arrow" />
        </div>
    )
}

const CareerPage = () => {
    useInitScrollTop()
    return (
        <Page>
            <div className="CareersPage">
                <div className="careers-banner">
                    <div className="text-container">
                        <div className="sub-text">Careers  >  Welcome to AirQo</div>
                        <div className="main-text">Join our team</div>
                        <div className="text-brief">Be part of a team pioneering air quality monitoring in Africa. Together, we work passionately towards our vision for Clean Air for all African Cities</div>
                    </div>
                </div>
                <div className="content">
                    <div className="container">
                        <div className="label">Categories</div>
                        <div className="tags">
                            <span className="tag tag-selected">Open positions</span>
                            <span className="tag">All</span>
                            <span className="tag">Administrative</span>
                            <span className="tag">Engineering</span>
                            <span className="tag">Product</span>
                            <span className="tag">Data Science</span>
                            <span className="tag">Policy</span>
                            <span className="tag">Business Development</span>
                            <span className="tag">Machine Learning & AI</span>
                            <span className="tag">Hardware</span>
                            <span className="tag">Design</span>
                            <span className="tag">Marketing</span>
                            <span className="tag">Communications</span>
                        </div>
                        {/*<div className="department">Engineering(02)</div>*/}
                        {/*<JobListing title={"DevOps Engineer"} type={"Full Time, *Remote"} />*/}
                        {/*<JobListing title={"Front End Engineer"} type={"Full Time"} />*/}

                        {/*<div className="department">Hardware(03)</div>*/}
                        {/*<JobListing title={"DevOps Engineer"} type={"Full Time"} />*/}
                        {/*<JobListing title={"DevOps Engineer"} type={"Full Time"} />*/}
                        {/*<JobListing title={"DevOps Engineer"} type={"Full Time"} />*/}

                        <div className="no-listing">Currently, we have no open position.</div>

                        <div className="self-intro">
                            <span>Don’t see a <br/>position that fits you perfectly? Introduce yourself here </span>
                            <span>careers@airqo.africa</span>
                        </div>
                    </div>

                </div>

            </div>
        </Page>
    )
}

export default CareerPage;
