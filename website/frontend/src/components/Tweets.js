import React, { useEffect } from 'react';

const TweetsComponent = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    document.getElementsByClassName('twitter-embed')[0].appendChild(script);
  }, []);
  
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width:'100%'
      }}>
      <section className="twitterContainer" style={{ padding: '90px 60px 0 60px' }}>
        <div className="twitter-embed" style={{ maxWidth: '1088px', minWidth: '380px', width:'95vw'}}>
          <a
            className="twitter-timeline"
            data-theme="light"
            data-tweet-limit="5"
            data-chrome="noheader nofooter transparent"
            data-height="560"
            border-color="#eee"
            href="https://twitter.com/AirQoProject"
            style={{ fontWeight: '500', fontSize: '22px', fontFamily: 'Inter', opacity: '0.7' }}>
            Tweets by @AirQoProject
          </a>
        </div>
      </section>
    </div>
  );
};

export default TweetsComponent;
