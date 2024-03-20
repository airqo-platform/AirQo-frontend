import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { completeTask, updateVideoProgress } from '@/lib/store/services/checklists/CheckList';
import CloseIcon from '@/icons/close_icon';
import Spinner from '@/components/Spinner';

const CustomModal = ({ open, setOpen, videoUrl, checklistData }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const handleClickOutside = (event) => {
    if (backdropRef.current && !backdropRef.current.contains(event.target)) {
      setOpen(false);
      dispatch(updateVideoProgress({ id: 1, videoProgress: videoRef.current.currentTime }));
    }
  };

  useEffect(() => {
    if (open) {
      modalRef.current.focus();
      document.addEventListener('mousedown', handleClickOutside);
      const videoTime = checklistData.find(
        (card) => card.title === 'analytics_video',
      )?.videoProgress;
      if (videoTime) {
        videoRef.current.currentTime = videoTime;
      }
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      if (videoRef.current) {
        dispatch(updateVideoProgress({ id: 1, videoProgress: videoRef.current.currentTime }));
      }
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleVideoLoad = () => {
    setLoading(false);
  };

  const handleVideoPause = () => {
    dispatch(updateVideoProgress({ id: 1, videoProgress: videoRef.current.currentTime }));
  };

  const handleVideoEnd = () => {
    dispatch(updateVideoProgress({ id: 1, videoProgress: 0 }));
    dispatch(completeTask(1));
  };

  return (
    open && (
      <div
        ref={modalRef}
        id='custom-modal'
        tabIndex='-1'
        className={`fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center transform transition-transform duration-300 ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        } bg-gray-800 bg-opacity-50`}>
        <div
          ref={backdropRef}
          className='relative w-full h-[450px] max-w-2xl max-h-full bg-white rounded-xl shadow dark:bg-gray-700 p-1 mx-4 md:mx-0 animate-slide-in'>
          <h1 className='text-sm md:text-xl w-full text-center font-medium text-gray-900 p-3'>
            Introducing AirQo Analytics
          </h1>
          <button
            type='button'
            onClick={() => {
              setOpen(!open);
              dispatch(updateVideoProgress({ id: 1, videoProgress: videoRef.current.currentTime }));
            }}
            className='absolute top-0 right-0 md:-top-[25px] md:-right-[24px] m-2 text-gray-400 bg-blue-600 hover:bg-blue-900 hover:text-gray-900 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white'
            data-modal-hide='custom-modal'>
            <CloseIcon fill='#FFFFFF' />
            <span className='sr-only'>Close modal</span>
          </button>
          <div className='w-full h-full max-h-[384px] relative'>
            {loading && (
              <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center'>
                <Spinner />
              </div>
            )}
            <video
              ref={videoRef}
              onCanPlayThrough={handleVideoLoad}
              onPause={handleVideoPause}
              onEnded={handleVideoEnd}
              className={`w-full h-full ${loading ? 'hidden' : 'block'}`}
              src={videoUrl}
              controls
              autoPlay
            />
          </div>
        </div>
      </div>
    )
  );
};

export default CustomModal;
