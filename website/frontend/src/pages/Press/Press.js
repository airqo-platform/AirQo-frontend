import React from 'react';
import { useInitScrollTop } from 'utils/customHooks';
import TheConversationIcon from 'icons/press/the-conversation.svg';
import ZindiIcon from 'icons/press/zindi.svg';
import DevexIcon from 'icons/press/devex.svg';
import PMLDailyIcon from 'icons/press/pml-daily.svg';
import Article from './Article';
import Page from '../Page';

const Press = () => {
  useInitScrollTop();
  return (
    <Page>
      <div className="press-page">
        <div className="p-header">
          <div className="content">
            <div className="press-top">
              <h2>In the Press</h2>
              <span className="sub-title">
                Stories about AirQo that we think you'll love
              </span>
            </div>
          </div>
        </div>
        <div className="p-body">
          <div className="content">
            <div className="press-cards">
              <div className="card">
                <Article
                  title="How we’re measuring air quality in Kampala - and why it works for African cities"
                  subtitle="How we’re measuring air quality in Kampala - and why it works for African cities"
                  url="https://theconversation.com/how-were-measuring-air-quality-in-kampala-and-why-it-works-for-african-cities-143006"
                  icon={<TheConversationIcon />}
                />
              </div>
              <div className="card">
                <Article
                  title="Makerere’s AirQo project to expand its air quality monitoring project to other African countries"
                  subtitle="Makerere’s AirQo project to expand its air quality monitoring project to other African countries"
                  url="http://nilepost.co.ug/2021/10/07/airqo-makerere-to-expand-its-air-quality-monitoring-project-to-other-african-countries/"
                />
              </div>
              <div className="card">
                <Article
                  title="Zindi winners Darius and Nikhil help AirQo improve air quality predictions in Africa"
                  subtitle="Zindi winners Darius and Nikhil help AirQo improve air quality predictions in Africa"
                  url="https://zindi.medium.com/zindi-winners-darius-and-nikhil-help-airqo-improve-air-quality-predictions-in-africa-a9a7c1eaa00f"
                  icon={<ZindiIcon />}
                />
              </div>
              <div className="card">
                <Article
                  title="How data is changing the narrative on air pollution in Uganda"
                  subtitle="How data is changing the narrative on air pollution in Uganda"
                  url="https://www.devex.com/news/how-data-is-changing-the-narrative-on-air-pollution-in-uganda-102672"
                  icon={<DevexIcon />}
                />
              </div>
            </div>
            <div className="press-cards-lg">
              <div className="card-lg">
                <Article
                  title="AirQo Project to expand its air quality monitoring network to more African countries"
                  subtitle="AirQo Project to expand its air quality monitoring network to more African countries"
                  url="https://www.pmldaily.com/features/health/2021/10/airqo-project-to-expand-its-air-quality-monitoring-network-to-more-african-countries.html"
                  date="Oct 7, 2021"
                  icon={<PMLDailyIcon />}
                />
              </div>
            </div>
          </div>
          <div className='show-more'>
            <span> <a>Show more {'->'} </a></span>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Press;
