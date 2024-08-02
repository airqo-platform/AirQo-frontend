import React, { useRef, useState } from 'react';
import TwitterIcon from '@mui/icons-material/Twitter';
import { useIntersectionObserver } from 'utilities/customHooks';
import LinkedIn from '../icons/footer/LinkedIn.svg';
import Modal from './Modal';

const Image = (props) => {
  return (
    <>
      <img
        className={`profile-image ${props.src ? 'profile-image-loaded' : 'profile-image-thumb'}`}
        alt={props.alt}
        src={props.src ? props.src : props.thumb}
        loading="lazy"
      />
    </>
  );
};

const Profile = ({
  ImgPath,
  name,
  title,
  cardTitle,
  twitter,
  linkedin,
  twitter_forum,
  linkedin_forum,
  biography,
  about,
  readBioBtn = false,
  htmlBio,
}) => {
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
    },
  });

  return (
    <div className="profile">
      {show && (
        <Modal show={show} closeModal={() => setShow(false)}>
          <div className="modal-content">
            <div className="bio-header-container">
              <div className="bio-header">
                <div className="name">{name}</div>
                {cardTitle ? (
                  <div className="title">{cardTitle}</div>
                ) : (
                  <div className="title">{title}</div>
                )}

                <div className="social-container">
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkedIn />
                    </a>
                  )}
                  {twitter && (
                    <a href={twitter} target="_blank" rel="noopener noreferrer">
                      <TwitterIcon
                        className="profile_twitter_handle"
                        style={{ padding: '6px' }}
                      />
                    </a>
                  )}
                </div>
                {/* clean air forum */}
                <div
                  className="social-container"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {linkedin_forum && (
                    <a href={linkedin_forum} target="_blank">
                      <LinkedIn />
                    </a>
                  )}
                  {twitter_forum && (
                    <a
                      href={twitter_forum}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <TwitterIcon style={{ padding: '6px' }} />
                    </a>
                  )}
                </div>
              </div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: '400',
                  cursor: 'pointer',
                  fontFamily: 'sans-serif',
                }}
                onClick={() => setShow(false)}
              >
                {'X'}
              </div>
            </div>
            <div className="biography">
              <span>
                {isVisible && <img src={ImgPath} alt={`${name}'s Profile`} />}
              </span>
              <span className="bio-text">
                {htmlBio ? (
                  <div dangerouslySetInnerHTML={{ __html: htmlBio }} />
                ) : about ? (
                  <p className="description">{about}</p>
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
      <div
        className="img-preview-container"
        ref={ref}
        onClick={() => setShow(true)}
      >
        {isVisible && <Image src={ImgPath} alt="Profile Img" />}
      </div>
      <div className="info">
        <div className="info-left">
          <h3>{name}</h3>
          <h6>{title}</h6>
          {readBioBtn && (
            <div className="read-bio-btn">
              <span onClick={() => setShow(true)}>Read Bio</span>
              <span
                className="social-container"
                target="_blank"
                rel="noopener noreferrer"
              >
                {linkedin_forum && (
                  <a href={linkedin_forum} target="_blank">
                    <LinkedIn />
                  </a>
                )}
                {twitter_forum && (
                  <a
                    href={twitter_forum}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TwitterIcon className="profile_twitter_handle" />
                  </a>
                )}
              </span>
            </div>
          )}
        </div>
        {linkedin_forum || twitter_forum ? null : (
          <div
            className="social-container"
            target="_blank"
            rel="noopener noreferrer"
          >
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
        )}
      </div>
    </div>
  );
};
export default Profile;
