import React from 'react';
import Button from '@/components/Button';
import WeekPrediction from './Predictions';
import PollutantCard from './PollutantCard';
import LocationAlertCard from './LocationAlertCard';
import SectionDivider from './SectionDivider';
import { GoArrowLeft } from 'react-icons/go';

const DetailsView = React.memo(
  ({
    location,
    weeklyPredictions,
    loading,
    onBack,
    selectedWeeklyPrediction,
  }) => {
    const displayName = (
      location?.description ||
      location?.search_name ||
      location?.location ||
      ''
    ).split(',')[0];

    return (
      <div className="px-3">
        <div className="pt-3 pb-2 flex items-center gap-2 mb-3">
          <Button padding="p-0" onClick={onBack} variant="text" type="button">
            <GoArrowLeft className="text-gray-400 dark:text-white" size={25} />
          </Button>
          <h3 className="text-lg text-black-800 dark:text-white font-medium leading-6 truncate">
            {displayName}
          </h3>
        </div>

        <WeekPrediction
          selectedSite={location}
          weeklyPredictions={weeklyPredictions}
          loading={loading}
        />
        <SectionDivider />
        <div className="mb-3 flex flex-col gap-3">
          <PollutantCard
            selectedSite={location}
            selectedWeeklyPrediction={selectedWeeklyPrediction}
          />
          <LocationAlertCard
            title="Air Quality Alerts"
            selectedSite={location}
            selectedWeeklyPrediction={selectedWeeklyPrediction}
          />
        </div>
      </div>
    );
  },
);

DetailsView.displayName = 'DetailsView';
export default DetailsView;
