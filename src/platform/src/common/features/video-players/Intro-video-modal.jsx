'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { updateTaskProgress } from '@/lib/store/services/checklists/CheckList';
import CloseIcon from '@/icons/close_icon';
import Spinner from '@/components/Spinner';
import Card from '@/components/CardWrapper';
import ErrorBoundary from '@/components/ErrorBoundary';

const VideoModal = ({ open, setOpen, videoUrl }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const reduxChecklist = useSelector((state) => state.cardChecklist.checklist);
  const videoChecklistItem = reduxChecklist[0];

  // Get user session
  const { data: session } = useSession();
  // Get userId from session only - no localStorage fallback needed
  const getUserId = useCallback(() => {
    return session?.user?.id || null;
  }, [session]);

  // Calculate and update video progress - only called on pause, end, or close
  const updateVideoState = useCallback(() => {
    if (!videoRef.current || !videoChecklistItem?._id) return;

    // Get user ID from NextAuth session or fallback
    const userId = getUserId();
    if (!userId) {
      // No user ID available for updating video progress
      return;
    }

    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    const progressPercent = Math.round((currentTime / duration) * 100);

    dispatch(
      updateTaskProgress({
        _id: videoChecklistItem._id,
        videoProgress: progressPercent,
        userId: userId,
        status:
          videoChecklistItem.status === 'not started'
            ? 'inProgress'
            : videoChecklistItem.status,
      }),
    );
  }, [dispatch, videoChecklistItem, getUserId]);

  // Seek to last progress when video loads
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && videoChecklistItem?.videoProgress) {
      const duration = videoRef.current.duration;
      videoRef.current.currentTime =
        (videoChecklistItem.videoProgress / 100) * duration;
    }
  }, [videoChecklistItem]);

  // Close handlers
  const handleClickOutside = useCallback(
    (event) => {
      if (backdropRef.current && !backdropRef.current.contains(event.target)) {
        handleCloseModal();
      }
    },
    [
      /* handleCloseModal defined below */
    ],
  );

  // Update progress and close modal
  const handleCloseModal = useCallback(() => {
    updateVideoState();
    setOpen(false);
  }, [updateVideoState, setOpen]);

  // Setup event listeners and cleanup
  useEffect(() => {
    if (open) {
      modalRef.current?.focus();
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, handleClickOutside]);

  // Handle video pause event - update progress
  const handleVideoPause = useCallback(() => {
    updateVideoState();
  }, [updateVideoState]);

  // Handle video end event - mark as completed
  const handleVideoEnd = useCallback(() => {
    if (!videoChecklistItem?._id) return;

    const userId = getUserId();
    if (!userId) {
      // No user ID available for completing video task
      return;
    }

    dispatch(
      updateTaskProgress({
        _id: videoChecklistItem._id,
        status: 'completed',
        completed: true,
        videoProgress: 100,
        completionDate: new Date().toISOString(),
        userId: userId,
      }),
    );
  }, [dispatch, videoChecklistItem, getUserId]);

  // Handle video load events
  const handleVideoLoad = () => setLoading(false);

  if (!open) return null;
  return (
    <ErrorBoundary name="VideoModal" feature="Video Player">
      <div
        ref={modalRef}
        id="custom-modal"
        tabIndex="-1"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-800/50 backdrop-blur-sm"
      >
        <div className="relative w-full max-w-2xl mx-4 md:mx-0">
          <button
            type="button"
            onClick={handleCloseModal}
            className="absolute -top-4 -right-2 z-10 bg-primary hover:bg-primary/70 transition-colors duration-200 rounded-full text-sm w-8 h-8 flex justify-center items-center shadow-md"
            data-modal-hide="custom-modal"
          >
            <CloseIcon fill="#FFFFFF" className="w-4 h-4" />
            <span className="sr-only">Close modal</span>
          </button>

          <Card
            ref={backdropRef}
            width="w-full"
            height="h-[520px]"
            className="animate-slide-in relative transition-all duration-300"
            contentClassName="flex flex-col h-full"
            shadow="shadow-lg"
          >
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-base md:text-xl text-center font-semibold text-gray-900 dark:text-white">
                Introducing AirQo Analytics
              </h1>
            </div>

            <div className="flex-grow relative w-full bg-gray-100 dark:bg-gray-800">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800 transition-opacity duration-300">
                  <Spinner className="w-8 h-8" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Loading video...
                  </p>
                </div>
              )}

              <div className="w-full h-[432px]">
                <video
                  ref={videoRef}
                  onLoadedMetadata={handleLoadedMetadata}
                  onCanPlayThrough={handleVideoLoad}
                  onPause={handleVideoPause}
                  onEnded={handleVideoEnd}
                  className={`w-full h-full object-contain ${
                    loading ? 'opacity-0' : 'opacity-100'
                  } transition-opacity duration-300`}
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default VideoModal;
