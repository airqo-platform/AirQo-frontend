import React from 'react';
import Dialog from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui';
import { AqPlayCircle } from '@airqo/icons-react';

interface VideoTutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Video tutorial dialog component for data download guide
 * Displays a professional video player with custom controls
 */
export const VideoTutorialDialog: React.FC<VideoTutorialDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = React.useState(false);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="How to Download Data"
      subtitle="This tutorial will guide you through the process of visualizing and downloading air quality data."
      size="2xl"
      showCloseButton={true}
      preventBackdropClose={false}
      maxHeight="max-h-[90vh]"
      contentClassName="p-0"
      contentAreaClassName="px-0 py-0"
      showFooter={true}
      primaryAction={{
        label: 'Close',
        onClick: handleClose,
        variant: 'outlined',
      }}
    >
      <div className="relative w-full bg-black overflow-hidden">
        {videoError ? (
          <div className="flex items-center justify-center h-full aspect-video text-white">
            <div className="text-center">
              <p className="mb-4">
                Video failed to load. Please check your internet connection and
                try again.
              </p>
              <Button
                onClick={() => setVideoError(false)}
                variant="outlined"
                className="text-white border-white hover:bg-white hover:text-black"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover"
            controls
            controlsList="nodownload"
            preload="metadata"
            poster="/images/Account/analyticsImage.webp"
            onError={e => {
              console.error('Video load error:', e);
              setVideoError(true);
            }}
            aria-label="Tutorial video demonstrating how to download air quality data"
          >
            <source
              src="https://res.cloudinary.com/dbibjvyhm/video/upload/v1766068528/Analytics/videos/Data_Download_dcbaox.mp4"
              type="video/mp4"
            />
            {/* Add track for captions if available */}
            {/* <track kind="captions" srclang="en" label="English" src="path/to/captions.vtt" /> */}
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </Dialog>
  );
};

/**
 * Video tutorial button component
 * Displays a professional help button for accessing the tutorial
 */
interface VideoTutorialButtonProps {
  onClick: () => void;
  className?: string;
}

export const VideoTutorialButton: React.FC<VideoTutorialButtonProps> = ({
  onClick,
  className = '',
}) => {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      Icon={AqPlayCircle}
      className={`px-4 py-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 ${className}`}
    >
      <span className="hidden sm:inline">How to Download</span>
      <span className="sm:hidden">Tutorial</span>
    </Button>
  );
};
