import React from 'react';
import { useInitScrollTop } from 'utils/customHooks';
import TheConversationIcon from 'icons/press/the-conversation.svg';
import ZindiIcon from 'icons/press/zindi.svg';
import DevexIcon from 'icons/press/devex.svg';
import PMLDailyIcon from 'icons/press/pml-daily.svg';
import LifeWireIcon from 'icons/press/Lifewire-logo.svg';
import VOAIcon from 'icons/press/VoaLogo.svg';
import Article from './Article';
import Page from '../Page';
import SEO from 'utils/seo';

const Press = () => {
  useInitScrollTop();
  return (
      <Page>
          <div className="press-page">
              <SEO title="Press" siteTitle="AirQo" description="Find stories about AirQo that we think you'll love." />
              <div className="p-header">
                  <div className="content">
                      <div className="press-top">
                          <h2>In the Press</h2>
                          <span className="sub-title">Stories about AirQo that we think you'll love</span>
                      </div>
                  </div>
              </div>
              <div className="p-body">
                  <div className="content">
                      <div className="press-cards">
                          <div className="card">
                              <Article
                                  title="Ugandan Researchers Develop Low-Cost Sensors to Track Air Pollution "
                                  subtitle="Ugandan researchers have developed low-cost air quality monitoring sensors that work in extreme conditions"
                                  url="https://www.voanews.com/a/ugandan-researchers-develop-low-cost-sensors-to-track-air-pollution/6595195.html"
                                  date="May 30, 2022"
                                  icon={<VOAIcon style={{height:'52px'}}/>}
                              />
                          </div>
                          <div className="card">
                              <Article
                                  title="Low-Cost Sensors Could Help Monitor Air Pollution"
                                  subtitle="Air pollution is worsening around the world, but keeping track of just how bad it is on a daily basis can involve expensive equipment."
                                  url="https://www.lifewire.com/low-cost-sensors-could-help-monitor-air-pollution-5324278"
                                  date="Jun 2, 2022"
                                  icon={<LifeWireIcon />}
                              />
                          </div>
                          <div className="card">
                              <Article
                                  title="How data is changing the narrative on air pollution in Uganda"
                                  subtitle="How data is changing the narrative on air pollution in Uganda"
                                  url="https://www.devex.com/news/how-data-is-changing-the-narrative-on-air-pollution-in-uganda-102672"
                                  date="Feb 15, 2022"
                                  icon={<DevexIcon />}
                              />
                          </div>
                          <div className="card">
                              <Article
                                  title="Makerere’s AirQo project to expand its air quality monitoring project to other African countries"
                                  subtitle="Makerere’s AirQo project to expand its air quality monitoring project to other African countries"
                                  url="http://nilepost.co.ug/2021/10/07/airqo-makerere-to-expand-its-air-quality-monitoring-project-to-other-african-countries/"
                                  date="Oct 7, 2021"
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
                      <div className="press-cards">
                          <div className="card">
                              <Article
                                  title="Zindi winners Darius and Nikhil help AirQo improve air quality predictions in Africa"
                                  subtitle="Zindi winners Darius and Nikhil help AirQo improve air quality predictions in Africa"
                                  url="https://zindi.medium.com/zindi-winners-darius-and-nikhil-help-airqo-improve-air-quality-predictions-in-africa-a9a7c1eaa00f"
                                  date="Sep 17, 2020"
                                  icon={<ZindiIcon />}
                              />
                          </div>
                          <div className="card">
                              <Article
                                  title="How we’re measuring air quality in Kampala - and why it works for African cities"
                                  subtitle="How we’re measuring air quality in Kampala - and why it works for African cities"
                                  url="https://theconversation.com/how-were-measuring-air-quality-in-kampala-and-why-it-works-for-african-cities-143006"
                                  date="Aug 26, 2020"
                                  icon={<TheConversationIcon />}
                              />
                          </div>
                      </div>
                  </div>
                  <div className="show-more">
                      <span>
                          {' '}
                          <a>See More {'->'} </a>
                      </span>
                  </div>
              </div>
          </div>
      </Page>
  );
};

export default Press;
