import React, { useEffect, useState, useRef } from 'react';
import SEO from 'utilities/seo';
import { useInitScrollTop } from 'utilities/customHooks';
import { isEmpty } from 'underscore';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveResource } from 'reduxStore/CleanAirNetwork/CleanAir';
import { CardComponent, ReportComponent } from 'components/CleanAir';
import { getAllCleanAirApi } from 'apis/index.js';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import useWindowSize from 'utilities/customHooks';

const ResourceMenuItem = ({ activeResource, resource, dispatch }) => {
  const isActive = activeResource === resource;
  const className = isActive ? 'active' : 'resource-menu-item-link';
  const onClick = () => dispatch(setActiveResource(resource));

  return (
    <li className={className} onClick={onClick}>
      {resource.charAt(0).toUpperCase() + resource.slice(1)}
    </li>
  );
};

const CleanAirPublications = () => {
  useInitScrollTop();
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const [toggle, setToggle] = useState(false);
  const [cleanAirResources, setCleanAirResources] = useState([]);
  const activeResource = useSelector((state) => state.cleanAirData.activeResource);
  const resources = ['toolkits', 'technical reports', 'workshop reports', 'research publications'];

  useEffect(() => {
    if (isEmpty(activeResource)) {
      dispatch(setActiveResource('toolkits'));
    }
  }, [activeResource]);

  // useEffect(() => {
  //   getAllCleanAirApi()
  //     .then((response) => {
  //       console.log(response);
  //       // const { data } = response;
  //       // setCleanAirResources(data);
  //     })
  //     .catch((error) => console.log(error));
  // }, []);

  const { width } = useWindowSize();

  useEffect(() => {
    const resourceMenuItem = document.querySelector('.menu-wrapper');
    if (width < 1081) {
      resourceMenuItem.style.display = 'none';
    } else {
      resourceMenuItem.style.display = 'block';
    }
  }, [width]);

  const handleToggle = () => {
    setToggle(!toggle);
    const resourceMenuItem = document.querySelector('.menu-wrapper');
    if (toggle) {
      resourceMenuItem.style.display = 'none';
    } else {
      resourceMenuItem.style.display = 'block';
    }
  };

  return (
    <div className="page-wrapper">
      <SEO
        title="CLEAN-Air Africa Network | Partners"
        siteTitle="CLEAN-Air Africa Network"
        description="CLEAN-Air Africa Network is a network of African cities and partners committed to improving air quality and reducing carbon emissions through knowledge sharing and capacity building."
      />

      <div className="partners">
        <div className="partners-wrapper">
          <div className="resources-container">
            <div className="resource-menu">
              <div className="title-wrapper">
                <h1 className="resource-menu-title">
                  RESOURCE
                  <br />
                  <span>CENTER</span>
                </h1>

                <div className="resource-menu-icon" onClick={handleToggle}>
                  {toggle ? <CloseIcon fontSize="large" /> : <ListIcon fontSize="large" />}
                </div>
              </div>
              <div className="menu-wrapper" ref={menuRef}>
                <ul className="resource-menu-item">
                  {resources.map((resource) => (
                    <ResourceMenuItem
                      key={resource}
                      activeResource={activeResource}
                      resource={resource}
                      dispatch={dispatch}
                    />
                  ))}
                </ul>
              </div>
            </div>

            <div className="resource-body">
              {activeResource === 'toolkits' && (
                <CardComponent
                  title="Air Quality Management in Africa: A Guide for Practitioners"
                  authors="In this example, all list items except the first one will have a top margin of 10px. You can adjust the value as needed to suit your design. This is a simple and effective way to apply styles to middle items in a list. Note that this will also apply the margin to the last item. If you want to exclude the last item as well, you"
                  link="https://www.cleanairafrica.org/wp-content/uploads/2021/09/"
                  linkTitle="Read Journal"
                  downloadLink="https://www.cleanairafrica.org/wp-content/uploads/2021/09/Air-Quality-Management-in-Africa-A-Guide-for-Practitioners.pdf"
                />
              )}
              {activeResource === 'technical reports' && (
                <ReportComponent
                  title="Air Quality Management in Africa: A Guide for Practitioners"
                  authors="led by the Clean Air Africa Network"
                  link="https://www.cleanairafrica.org/wp-content/uploads/2021/09/Air-Quality-Management-in-Africa-A-Guide-for-Practitioners.pdf"
                  linkTitle="Read Journal"
                  showSecondAuthor={false}
                  resourceFile="https://www.cleanairafrica.org/wp-content/uploads/2021/09/Air-Quality-Management-in-Africa-A-Guide-for-Practitioners.pdf"
                />
              )}
              {activeResource === 'workshop reports' && (
                <ReportComponent
                  title="How to Develop an Air Quality Management Plan for Your City"
                  authors="Led by the Clean Air Africa Network"
                  link="https://www.cleanairafrica.org/wp-content/uploads/2021/09/Air-Quality-Management-in-Africa-A-Guide-for-Practitioners.pdf"
                  linkTitle="Read Journal"
                  showSecondAuthor={false}
                  resourceFile="https://www.cleanairafrica.org/wp-content/uploads/2021/09/Air-Quality-Management-in-Africa-A-Guide-for-Practitioners.pdf"
                />
              )}
              {activeResource === 'research publications' && (
                <CardComponent
                  title="Nairobi Air Quality Management Plan (2019-2024)"
                  authors="Nairobi City County"
                  link="https://www.cleanairafrica.org/wp-content/uploads/2021/09/Air-Quality-Management-in-Africa-A-Guide-for-Practitioners.pdf"
                  linkTitle="Read More"
                  downloadLink={null}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanAirPublications;
