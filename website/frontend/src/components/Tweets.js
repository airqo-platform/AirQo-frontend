import React, { useEffect } from 'react';

const TweetsComponent = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    document.getElementsByClassName('twitter-embed')[0].appendChild(script);
  }, []);
//   const iframes = document.getElementsByClassName('css-1dbjc4n r-140t1nj r-qklmqi');
  const iframe = document.getElementById("twitter-widget-0");
//   console.log(iframes.length)

//   element = iframe.contentWindow.document.getElementsByClassName(
//     'css-1dbjc4n r-140t1nj r-qklmqi'
//   );
  console.log(iframe)
  return (
    <section className="twitterContainer" style={{ padding: '90px 60px 0 60px' }}>
      <div className="twitter-embed">
        <a
          className="twitter-timeline"
          data-theme="light"
          data-tweet-limit="3"
          data-chrome="noheader nofooter"
          width="400"
          border-color="#eee"
          href="https://twitter.com/AirQoProject"
          style={{ fontWeight: '500', fontSize: '22px', fontFamily: 'Inter', opacity:'0.7' }}>
          Tweets by @AirQoProject
        </a>
      </div>
    </section>
  );
};

export default TweetsComponent;
