import React, { useState, useEffect } from 'react';
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { useInitScrollTop } from 'utils/customHooks';
import Page from './Page';
import { loadCareersListingData, loadCareersDepartmentsData } from "reduxStore/Careers/operations";
import { useCareerListingData, useCareerDepartmentsData } from "reduxStore/Careers/selectors";
import { isEmpty } from "underscore";
import { groupBy } from "underscore";
import SEO from 'utils/seo';


const JobListing = ({title, uniqueTitle, type, key}) => {
    const navigate = useNavigate();
    const onClick = (uniqueTitle) => (event) => {
        event.preventDefault();
        navigate(`/careers/${uniqueTitle}/`)
    }
    return (
        <div className="listing" key={key} onClick={onClick(uniqueTitle)}>
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
            {listing.map((job, key) => <JobListing key={key} title={job.title} uniqueTitle={job.unique_title} type={job.type.replace("-", " ")} />)}
        </>
    )
}

const CareerPage = () => {
    useInitScrollTop()
    const dispatch = useDispatch();
    const careerListing = useCareerListingData();
    const departments = useCareerDepartmentsData();

    const groupedListing = groupBy(Object.values(careerListing), (v) => v["department"]["name"])

    const [groupedKeys, setGroupedKeys] = useState(Object.keys(groupedListing));
    const [selectedTag, setSelectedTag] = useState('all')

    const filterGroups = (value) => {
        setSelectedTag(value)
        const allKeys = Object.keys(groupedListing)
        if (value === 'all') return setGroupedKeys(allKeys);
        return setGroupedKeys(allKeys.filter(v => v === value));
    }

    const onTagClick = (value) => (event) => {
        event.preventDefault()
        filterGroups(value)
    }

    const selectedTagClassName = (tag) => {
        if (tag === selectedTag) return `tag tag-selected`;
        return `tag`;
    }

    useEffect(() => {
        if (isEmpty(careerListing)) dispatch(loadCareersListingData());
        if (isEmpty(departments)) dispatch(loadCareersDepartmentsData());
    }, [])

    useEffect(() => {
        setGroupedKeys(Object.keys(groupedListing))
    }, [careerListing])


    return (
        <Page>
            <div className="CareersPage">
                <SEO
                    title="Careers"
                    siteTitle="AirQo"
                    description="Be part of a team pioneering air quality monitoring in Africa. Together, we work passionately towards our vision for Clean Air for all African Cities."
                />
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
                            <span className={selectedTagClassName('all')} onClick={onTagClick('all')}>Open positions</span>
                            {departments.map((department) =>
                                <span className={selectedTagClassName(department.name)} key={department.id} onClick={onTagClick(department.name)}>{department.name}</span>)
                            }
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
                            <span>careers@airqo.net</span>
                        </div>
                    </div>

                </div>

            </div>
        </Page>
    )
}

export default CareerPage;
