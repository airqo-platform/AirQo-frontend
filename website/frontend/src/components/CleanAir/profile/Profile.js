import React, { useRef, useState } from 'react';
import TwitterIcon from '@mui/icons-material/Twitter';
import { useIntersectionObserver } from 'utilities/customHooks';
import LinkedIn from '../../../icons/footer/LinkedIn.svg';
import Modal from '../../Modal';

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
  category,
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
            <div
              style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                padding: '10px',
                fontSize: '15px',
                cursor: 'pointer',
              }}
              onClick={() => setShow(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
              >
                <path
                  d="M1.57043 10.1661L0.7771 9.37274L5.00821 5.14163L0.7771 0.910521L1.57043 0.117188L5.80154 4.3483L10.0327 0.117188L10.826 0.910521L6.59488 5.14163L10.826 9.37274L10.0327 10.1661L5.80154 5.93496L1.57043 10.1661Z"
                  fill="#353E52"
                />
              </svg>
            </div>

            <div className="biography">
              <span>
                {isVisible && <img src={ImgPath} alt={`${name}'s Profile`} />}
              </span>
              <div className="bio-text">
                <div>
                  <span
                    style={{
                      textDecoration: 'uppercase',
                      marginBottom: '10px',
                    }}
                  >
                    {category}
                  </span>
                  <h3
                    style={{
                      textDecoration: 'capitalize',
                      marginBottom: '10px',
                    }}
                  >
                    {name}
                  </h3>
                  <p
                    style={{
                      textDecoration: 'capitalize',
                      margin: '0',
                      padding: '0',
                    }}
                  >
                    {cardTitle}
                  </p>
                </div>
                <div style={{ margin: '30px 0' }}>
                  <hr />
                </div>
                <span>Bio</span>
                <div className="bio-container">
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
                </div>
              </div>
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
