import React, { useRef, useState } from 'react';
import TwitterIcon from '@mui/icons-material/Twitter';

const Image = props => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <React.Fragment>
      <img
        className="profile-image-thumb"
        alt={props.alt}
        src={props.thumb}
        style={{ visibility: isLoaded ? "hidden" : "visible" }}
      />
      <img
        onLoad={() => {
          setIsLoaded(true);
        }}
        className="profile-image-loaded"
        style={{ opacity: isLoaded ? 1 : 0 }}
        alt={props.alt}
        src={props.src}
      />
    </React.Fragment>
  );
};

const Profile = ({ImgPath, name, title}) => {
    const ref = useRef();
    const [isVisible, setIsVisible] = useState(false);
    
    useIntersectionObserver({
        target: ref,
        onIntersect: ([{ isIntersecting }], observerElement) => {
          if (isIntersecting) {
            setIsVisible(true);
            observerElement.unobserve(ref.current);
          }
        }
    });

    return (
        <div className="profile">
            <div className="img-preview-container" ref={ref}>
                {isVisible && <Image src={ImgPath} alt="Profile Img" />}
            </div>
            
            <div className="info">
                <div className="info-left">
                    <h3>{name}</h3>
                    <h6>{title}</h6>
                </div>
                <TwitterIcon className="profile_twitter_handle"/>
            </div>
        </div>
    );
}
export default Profile;
