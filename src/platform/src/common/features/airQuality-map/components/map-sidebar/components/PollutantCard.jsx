import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { isSameDay } from 'date-fns';
import { AqWind01 } from '@airqo/icons-react';
import { getAQIcon } from '../../MapNodes';
import { images } from '../../../constants/mapConstants';
import { useSelector } from 'react-redux';
import Card from '@/components/CardWrapper';

const PollutantCard = ({ selectedSite, selectedWeeklyPrediction }) => {
  const recentLocationMeasurements = useSelector(
    (state) => state.recentMeasurements.measurements,
  );

  const [pm2_5Value, setPM25Value] = useState('-');
  const [imageSrc, setImageSrc] = useState(images['Invalid']);

  useEffect(() => {
    const siteTime = new Date(
      selectedSite?.time || recentLocationMeasurements?.[0]?.time,
    );
    const predictionTime = selectedWeeklyPrediction
      ? new Date(selectedWeeklyPrediction.time)
      : null;
    const isSameDaySelected = predictionTime
      ? isSameDay(siteTime, predictionTime)
      : true;

    const newPM25Value = selectedWeeklyPrediction
      ? isSameDaySelected
        ? selectedSite.pm2_5?.toFixed(2) ||
          recentLocationMeasurements?.[0]?.pm2_5?.value?.toFixed(2) ||
          '-'
        : selectedWeeklyPrediction.pm2_5?.toFixed(2)
      : selectedSite?.pm2_5?.toFixed(2) ||
        recentLocationMeasurements?.[0]?.pm2_5?.value?.toFixed(2) ||
        '-';

    setPM25Value(newPM25Value);

    const newImageSrc = selectedWeeklyPrediction
      ? isSameDaySelected
        ? images[
            getAQIcon(
              'pm2_5',
              selectedSite.pm2_5 ||
                recentLocationMeasurements?.[0]?.pm2_5?.value,
            )
          ]
        : images[getAQIcon('pm2_5', selectedWeeklyPrediction.pm2_5)]
      : images[
          getAQIcon(
            'pm2_5',
            selectedSite.pm2_5 || recentLocationMeasurements?.[0]?.pm2_5?.value,
          )
        ];

    setImageSrc(newImageSrc);
  }, [selectedSite, selectedWeeklyPrediction, recentLocationMeasurements]);

  return (
    <Card
      padding="p-4"
      shadow="shadow"
      contentClassName="flex items-center justify-between w-full"
      className="flex items-center justify-between gap-4 hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 border dark:border-gray-600 rounded-xl"
    >
      {/* Left Content: Label and PM2.5 Value */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-secondary-neutral-dark-50 flex items-center justify-center">
            <AqWind01 />
          </div>
          <p className="text-sm font-medium text-gray-400 dark:text-gray-300">
            PM2.5
          </p>
        </div>
        <div className="mt-1 text-3xl font-bold text-gray-800 dark:text-white">
          {pm2_5Value}
        </div>
      </div>

      {/* Right Content: Air Quality Icon */}
      <div className="relative w-20 h-20">
        {' '}
        <Image
          src={imageSrc}
          alt="Air Quality Icon"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    </Card>
  );
};

PollutantCard.propTypes = {
  selectedSite: PropTypes.shape({
    time: PropTypes.string,
    pm2_5: PropTypes.number,
  }),
  selectedWeeklyPrediction: PropTypes.shape({
    time: PropTypes.string,
    pm2_5: PropTypes.number,
  }),
};

export default PollutantCard;
