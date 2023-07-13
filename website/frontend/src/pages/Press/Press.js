import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInitScrollTop } from 'utils/customHooks';
import Article from './Article';
import Page from '../Page';
import SEO from 'utils/seo';
import { loadPressData } from '../../../reduxStore/Press/PressSlice';
import { isEmpty } from 'underscore';
import Loadspinner from '../../components/LoadSpinner';

const Press = () => {
  useInitScrollTop();
  const dispatch = useDispatch();
  const pressData = useSelector((state) => state.pressData.press);
  const loading = useSelector((state) => state.pressData.loading);
  const [numArticlesToShow, setNumArticlesToShow] = useState(5);

  useEffect(() => {
    if (isEmpty(pressData)) {
      dispatch(loadPressData());
    }
  }, []);

  const sortedArticles = [...pressData].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleShowMore = () => {
    setNumArticlesToShow(numArticlesToShow + 5);
  };

  const handleShowLess = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setNumArticlesToShow(numArticlesToShow - 5);
  };

  return (
    <>
      {loading ? (
        <Loadspinner />
      ) : (
        <Page>
          <div className="list-page">
            <SEO
              title="Press"
              siteTitle="AirQo"
              description="Find stories about AirQo that we think you'll love."
            />
            <div className="page-header">
              <div className="content">
                <div className="title-wrapper">
                  <h2>In the Press</h2>
                  <span className="sub-title">Stories about AirQo that we think you'll love</span>
                </div>
              </div>
            </div>
            <div className="page-body">
              <div className="content">
                <div className="list-cards">
                  {sortedArticles.slice(0, numArticlesToShow).map((article, index) => {
                    if (index % 5 === 4) {
                      return (
                        <div className="press-cards-lg">
                          <div className="card-lg" style={{ paddingBottom: '0px' }}>
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
                      <div className="card">
                        <Article
                          key={article.id}
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
                    <a>See Less {'<-'} </a>
                  </span>
                </div>
              )}
              {numArticlesToShow < sortedArticles.length && (
                <div className="show-more" onClick={handleShowMore}>
                  <span>
                    <a>See More {'->'} </a>
                  </span>
                </div>
              )}
            </div>
          </div>
        </Page>
      )}
    </>
  );
};

export default Press;
