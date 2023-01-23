import React, { useRef, useState } from 'react';
import TwitterIcon from '@mui/icons-material/Twitter';
import { useIntersectionObserver } from 'utils/customHooks';
import LinkedIn from '../icons/footer/LinkedIn.svg';
import Modal from './Modal';

const Image = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <React.Fragment>
      <img
        className="profile-image profile-image-thumb"
        alt={props.alt}
        src={props.thumb}
        style={{ visibility: isLoaded ? 'hidden' : 'visible' }}
      />
      <img
        onLoad={() => {
          setIsLoaded(true);
        }}
        className="profile-image profile-image-loaded"
        style={{ opacity: isLoaded ? 1 : 0 }}
        alt={props.alt}
        src={props.src}
      />
    </React.Fragment>
  );
};

const Profile = ({ ImgPath, name, title, twitter, linkedin, biography, about }) => {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const [show, setShow] = useState(false);

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
      {show && (
        <Modal show={show} closeModal={() => setShow(false)}>
          <div className="modal-content">
            <div className="bio-header-container">
              <div className="bio-header">
                <div className="name">{name}</div>
                <div className="title">{title}</div>
                <div className="social-container">
                  {linkedin && (
                    <a href={linkedin} target="_blank" rel="noopener noreferrer">
                      <LinkedIn />
                    </a>
                  )}
                  {twitter && (
                    <a href={twitter} target="_blank" rel="noopener noreferrer">
                      <TwitterIcon className="profile_twitter_handle" style={{ padding: '6px' }} />
                    </a>
                  )}
                </div>
              </div>
              <div
                style={{ fontSize: '22px', fontWeight: '400', cursor: 'pointer', fontFamily:'sans-serif' }}
                onClick={() => setShow(false)}>
                {'X'}
              </div>
            </div>
            <div className="biography">
              <span>{isVisible && <img src={ImgPath} alt={`${name}'s Profile`} />}</span>
              <span className="bio-text">
                {about ? (
                  <p className='description'>{about}</p>
                ) : (
                  (biography || []).map((desc) => (
                    <p className="description" key={desc.id}>
                      {desc.description}
                    </p>
                  ))
                )}
              </span>
            </div>
          </div>
        </Modal>
      )}
      <div className="img-preview-container" ref={ref} onClick={() => setShow(true)}>
        {isVisible && <Image src={ImgPath} alt="Profile Img" />}
      </div>
      <div className="info">
        <div className="info-left">
          <h3>{name}</h3>
          <h6>{title}</h6>
        </div>
        <div className="social-container" target="_blank" rel="noopener noreferrer">
          {linkedin && (
            <a href={linkedin} target="_blank">
              <LinkedIn />
            </a>
          )}
          {twitter && (
            <a href={twitter} target="_blank" rel="noopener noreferrer">
              <TwitterIcon className="profile_twitter_handle" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
export default Profile;
