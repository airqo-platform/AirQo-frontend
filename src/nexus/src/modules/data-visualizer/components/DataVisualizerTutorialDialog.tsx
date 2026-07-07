'use client';

import React from 'react';
import Dialog from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui';

interface DataVisualizerTutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
}

export const DataVisualizerTutorialDialog: React.FC<
  DataVisualizerTutorialDialogProps
> = ({ isOpen, onClose, videoUrl }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = React.useState(false);
  const hasVideoUrl = Boolean(videoUrl?.trim());

  const attemptPlayback = React.useCallback(async (video: HTMLVideoElement) => {
    try {
      video.muted = false;
      await video.play();
      return;
    } catch (primaryError) {
      try {
        video.muted = true;
        await video.play();
      } catch (fallbackError) {
        console.error('Tutorial video playback failed.', {
          primaryError,
          fallbackError,
        });
        setVideoError(true);
      }
    }
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    setVideoError(false);
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen || !hasVideoUrl || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    video.currentTime = 0;

    void attemptPlayback(video);
  }, [attemptPlayback, hasVideoUrl, isOpen]);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    onClose();
  };

  const retryVideo = () => {
    setVideoError(false);
    if (videoRef.current) {
      const video = videoRef.current;
      const handleCanPlay = () => {
        void attemptPlayback(video);
      };

      video.addEventListener('canplay', handleCanPlay, { once: true });
      video.load();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="How to Use the Data Visualizer"
      subtitle="Watch a guided walkthrough of uploading, comparing, and switching datasets."
      size="2xl"
      showCloseButton
      maxHeight="max-h-[90vh]"
      contentClassName="p-0"
      contentAreaClassName="px-0 py-0"
      showFooter
      primaryAction={{
        label: 'Close',
        onClick: handleClose,
        variant: 'outlined',
      }}
    >
      <div className="overflow-hidden bg-black">
        {!hasVideoUrl ? (
          <div className="flex aspect-video items-center justify-center px-6 text-center text-white">
            <div className="max-w-md space-y-3">
              <p className="text-base font-medium">
                Tutorial video link not configured yet.
              </p>
              <p className="text-sm text-white/80">
                Add the published walkthrough video URL to the data visualizer
                constants file, then reopen this dialog to play it here.
              </p>
            </div>
          </div>
        ) : videoError ? (
          <div className="flex aspect-video items-center justify-center px-6 text-center text-white">
            <div className="max-w-md space-y-4">
              <p className="text-base font-medium">Video failed to load.</p>
              <p className="text-sm text-white/80">
                Check the tutorial link or your network connection, then try
                again.
              </p>
              <Button
                variant="outlined"
                onClick={retryVideo}
                className="border-white text-white hover:bg-white hover:text-black"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="aspect-video w-full object-cover"
            controls
            autoPlay
            playsInline
            preload="metadata"
            controlsList="nodownload"
            poster="/images/Account/analyticsImage.webp"
            onError={() => setVideoError(true)}
            aria-label="Tutorial video demonstrating how to use the data visualizer"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </Dialog>
  );
};
