import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { showGetInvolvedModal } from 'reduxStore/GetInvolved';
import useWindowSize from 'utilities/customHooks';
import { Link } from 'react-router-dom';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import CloseIcon from '@mui/icons-material/Close';
import { Modal, Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ReactPlayer from 'react-player/lazy';
import { useTranslation, Trans } from 'react-i18next';
import ThumbnailURL from '../assets/img/OurProducts/Monitor/activate.webp';

const VideoURL = 'https://youtu.be/2NebAd1F8x8';
const previewURL =
  'https://res.cloudinary.com/dbibjvyhm/video/upload/v1716038850/website/videos/opening_jtpafn.mov';

const breakPoint = 580;

const Button = ({ className, label, onClick }) => (
  <button className={className || 'button-hero'} onClick={onClick}>
    {label}
  </button>
);

const StyledModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const CenteredBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%'
}));

const VideoPlayer = ({ videoURL, thumbnailURL }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const handleVideoCanPlay = () => {
    setIsVideoLoaded(true);
  };

  return (
    <video
      src={videoURL}
      poster={!isVideoLoaded ? thumbnailURL : null}
      autoPlay
      muted
      loop
      onCanPlay={handleVideoCanPlay}
      onLoadedData={handleVideoCanPlay}
    />
  );
};

const Hero = () => {
  const size = useWindowSize();
  const dispatch = useDispatch();
  const showModal = useCallback(
    () => dispatch(showGetInvolvedModal({ openModal: true })),
    [dispatch]
  );

  const [modalVisible, setModalVisible] = useState(false);

  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);

  const { t } = useTranslation();
  return (
    <div className="Hero">
      <span>
        <div className="video-container">
          <div className="video-overlay">
            <VideoPlayer videoURL={previewURL} thumbnailURL={ThumbnailURL} />
            <div className="play-button" onClick={openModal}>
              <PlayCircleFilledIcon />
            </div>
          </div>
        </div>
      </span>
      <div className="hero-content">
        <div>
          <p className="hero-title">
            <Trans i18nKey="homepage.heroSection.title">
              Clean air for <br /> all African cities
            </Trans>
          </p>
          <p className="hero-sub">
            <span className="fact">“{t('homepage.heroSection.subText.fact')}”</span> <br />
            {t('homepage.heroSection.subText.desc')}
          </p>
          <div className="hero-buttons">
            <Link to="/explore-data">
              <Button label={t('navbar.exploreData')} />
            </Link>
            <Button
              className="button-get-involved"
              label={t('navbar.getInvolved')}
              onClick={showModal}
            />
          </div>
        </div>
      </div>
      <StyledModal open={modalVisible} onClose={closeModal}>
        <CenteredBox
          style={{
            border: 'none',
            outline: 'none'
          }}>
          <div className="modal-container">
            <IconButton
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '0',
                right: '0',
                color: 'white'
              }}>
              <CloseIcon />
            </IconButton>
            <ReactPlayer
              url={VideoURL}
              width={size.width > breakPoint ? '80vw' : '100vw'}
              height={size.width > breakPoint ? '80vh' : '100vh'}
              controls={true}
              playing={true}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload'
                  }
                }
              }}
              style={{
                border: 'none',
                outline: 'none'
              }}
            />
          </div>
        </CenteredBox>
      </StyledModal>
    </div>
  );
};

export default Hero;
