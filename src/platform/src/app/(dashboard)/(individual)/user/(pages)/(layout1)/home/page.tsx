'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Checklist } from '@/modules/user-checklist';
import { AqDownloadCloud01, AqStar06, AqBuilding07 } from '@airqo/icons-react';
import PlayIcon from '@/shared/components/ui/play-icon';

export default function HomePage() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModal = () => setIsModalOpen(!isModalOpen);

  const firstName =
    (session?.user as { firstName?: string })?.firstName || 'User';

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold  dark:text-white">
          Welcome, {firstName} <span aria-hidden>👋</span>
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground dark:text-gray-300">
          Quick Access
        </p>

        {/* Quick Access Buttons (left-aligned) */}
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <Button
            variant="outlined"
            size="md"
            Icon={AqDownloadCloud01}
            path="/user/data-export"
          >
            Download Data
          </Button>
          <Button
            variant="outlined"
            size="md"
            Icon={AqStar06}
            path="/user/favorites"
          >
            My Favorites
          </Button>
          <Button
            variant="outlined"
            size="md"
            Icon={AqBuilding07}
            path="/request-organization"
          >
            Request New Organization
          </Button>
        </div>
      </div>

      {/* Onboarding Checklist Section */}
      <Checklist
        isAnalyticsModalOpen={isModalOpen}
        onCloseAnalyticsModal={() => setIsModalOpen(false)}
      />

      {/* Information and Video Section */}
      <Card className="w-full p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col justify-start space-y-4">
            <h2 className="text-2xl font-medium dark:text-white">
              Track air pollution in places you care about
            </h2>
            <p className="text-base text-muted-foreground font-normal dark:text-white">
              Empower yourself with knowledge about the air you breathe; because
              clean air begins with understanding.
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <Button
                variant="filled"
                size="lg"
                path="/user/favorites"
                dataTestId="get-started-button"
              >
                Start here
              </Button>
              <Button
                variant="text"
                size="sm"
                onClick={handleModal}
                dataTestId="show-video-button"
              >
                Show me how
              </Button>
            </div>
          </div>
          <div
            className="rounded-md p-6 relative flex items-center justify-center cursor-pointer hover:bg-[#145DFF15]"
            style={{ background: '#145DFF08' }}
            onClick={handleModal}
            aria-label="Play Analytics Video"
            data-testid="video-thumbnail"
          >
            <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 hover:scale-110">
              <PlayIcon className="text-primary" />
            </div>
            <Image
              src="/images/Home/analyticsImage.webp"
              alt="Analytics Image"
              width={600}
              height={350}
              className="rounded-md"
              priority
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
