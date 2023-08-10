import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { showGetInvolvedModal } from 'reduxStore/GetInvolved/operations';
import useWindowSize from 'utils/customHooks';
import { Link } from 'react-router-dom';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import CloseIcon from '@mui/icons-material/Close';
import { Modal, Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import vid from '../assets/video/opening.mov';
import ReactPlayer from 'react-player/lazy';
import { border, borderRadius } from '@mui/system';
const VideoURL = 'https://youtu.be/2NebAd1F8x8';

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

const Hero = () => {
  const size = useWindowSize();
  const dispatch = useDispatch();
  const showModal = () => dispatch(showGetInvolvedModal(true));

  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  return (
    <div className="Hero">
      <span>
        <div className="video-container">
          <div className="video-overlay">
            <video src={vid} autoPlay muted loop id="myVideo" />
            <div className="play-button" onClick={openModal}>
              <PlayCircleFilledIcon />
            </div>
          </div>
        </div>
      </span>
      <div className="hero-content">
        <div>
          <p className="hero-title">
            Clean air for <br />
            all African cities
          </p>
          <p className="hero-sub">
            <span className="fact">“9 out of 10 people breathe polluted air”</span> <br />
            We empower communities with accurate, hyperlocal and timely air quality data to drive
            air pollution mitigation actions
          </p>
          <div className="hero-buttons">
            <Link to="/explore-data">
              <Button label="Explore data" />
            </Link>
            <Button className="button-get-involved" label="Get Involved" onClick={showModal} />
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
