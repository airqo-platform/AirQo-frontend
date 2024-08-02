import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInitScrollTop } from 'utilities/customHooks';
import Article from './Article';
import Page from '../Page';
import SEO from 'utilities/seo';
import { loadPressData } from '../../../reduxStore/Press/PressSlice';
import { isEmpty } from 'underscore';
import { useTranslation } from 'react-i18next';
import SectionLoader from '../../components/LoadSpinner/SectionLoader';

const Press = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const allPressData = useSelector((state) => state.pressData.pressData);
  const pressData = allPressData.filter(
    (event) => event.website_category === 'airqo'
  );
  const loading = useSelector((state) => state.pressData.loading);
  const [numArticlesToShow, setNumArticlesToShow] = useState(5);
  const language = useSelector((state) => state.eventsNavTab.languageTab);

  const sortedArticles = [...pressData].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  useEffect(() => {
    if (isEmpty(pressData)) {
      dispatch(loadPressData());
    }
  }, [dispatch, pressData, language]);

  const handleShowMore = () => {
    setNumArticlesToShow(numArticlesToShow + 5);
  };

  const handleShowLess = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setNumArticlesToShow(numArticlesToShow - 5);
  };

  return (
    <>
      <Page>
        <SEO
          title="Press"
          siteTitle="AirQo"
          description="Find stories about AirQo that we think you'll love."
        />
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh',
            }}
          >
            <SectionLoader />
          </div>
        ) : (
          <div className="list-page">
            <div className="page-header">
              <div className="content">
                <div className="title-wrapper">
                  <h2>{t('about.press.header.title')}</h2>
                  <span className="sub-title">
                    {t('about.press.header.subText')}
                  </span>
                </div>
              </div>
            </div>

            <div className="page-body">
              <div className="content">
                <div className="list-cards">
                  {sortedArticles
                    .slice(0, numArticlesToShow)
                    .map((article, index) => {
                      if (index % 5 === 4) {
                        return (
                          <div
                            className="press-cards-lg modulo"
                            key={article.id}
                          >
                            <div
                              className="card-lg"
                              style={{ paddingBottom: '0px' }}
                            >
                              <Article
                                key={article.id}
                                title={article.article_title}
                                subtitle={article.article_intro}
                                url={article.article_link}
                                date={article.date_published}
                                icon={article.publisher_logo}
                              />
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="card" key={article.id}>
                          <Article
                            title={article.article_title}
                            subtitle={article.article_intro}
                            url={article.article_link}
                            date={article.date_published}
                            icon={article.publisher_logo}
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
              {numArticlesToShow > 5 && (
                <div className="show-less" onClick={handleShowLess}>
                  <span>
                    <a>
                      {t('about.press.buttons.showLess')} {'<-'}{' '}
                    </a>
                  </span>
                </div>
              )}
              {numArticlesToShow < sortedArticles.length && (
                <div className="show-more" onClick={handleShowMore}>
                  <span>
                    <a>
                      {t('about.press.buttons.showMore')} {'->'}{' '}
                    </a>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Page>
    </>
  );
};

export default Press;
