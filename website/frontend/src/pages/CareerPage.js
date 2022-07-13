import React, { useEffect } from 'react';
import { useDispatch } from "react-redux";
import { useInitScrollTop } from 'utils/customHooks';
import Page from './Page';
import { loadCareersListingData } from "reduxStore/Careers/operations";
import { useCareerListingData } from "reduxStore/Careers/selectors";
import { isEmpty } from "underscore";
import {groupBy} from "underscore";


const JobListing = ({title, type, key}) => {
    return (
        <div className="listing" key={key}>
            <span className="title">{title}</span>
            <span className="type">{type}</span>
            <span className="arrow" />
        </div>
    )
}

const DepartmentListing = ({department, listing}) => {
    return (
        <>
            <div className="department">{department} ({String(listing.length).padStart(2, '0')})</div>
            {listing.map((job, key) => <JobListing key={key} title={job.title} type={job.type.replace("-", " ")} />)}
        </>
    )
}

const CareerPage = () => {
    useInitScrollTop()
    const dispatch = useDispatch();
    const careerListing = useCareerListingData();

    const groupedListing = groupBy(Object.values(careerListing), (v) => v["department"]["name"])

    const groupedKeys = Object.keys(groupedListing);

    console.log("grouped", groupedListing);
    console.log("grouped keys", groupedKeys);

    useEffect(() => {
        console.log('running effect')
        if (isEmpty(careerListing)) dispatch(loadCareersListingData());
    }, [])


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
                        {groupedKeys.length > 0 && groupedKeys.map((groupedKey, key) => {
                            const departmentListing = groupedListing[groupedKey]
                            return (
                                <DepartmentListing department={groupedKey} listing={departmentListing} key={groupedKey} />
                            )
                        })}

                        {groupedKeys.length <= 0 && <div className="no-listing">Currently, we have no open position.</div>}

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
