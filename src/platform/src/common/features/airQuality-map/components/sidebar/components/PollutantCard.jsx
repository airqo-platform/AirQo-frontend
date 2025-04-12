import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import { isSameDay } from 'date-fns';
import WindIcon from '@/icons/Common/wind.svg';
import { getAQIcon, images } from '../../MapNodes';
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
      padding="px-3 pt-3 pb-4"
      className="flex justify-between items-center"
      bordered={true}
      rounded={true}
      shadow="shadow"
      background="bg-secondary-neutral-dark-50"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-lg bg-secondary-neutral-dark-100 flex items-center justify-center">
            <WindIcon />
          </div>
          <p className="text-sm font-medium leading-tight text-secondary-neutral-dark-300">
            PM2.5
          </p>
        </div>
        <div className="text-2xl font-extrabold leading-normal text-secondary-neutral-light-800">
          {pm2_5Value}
        </div>
      </div>
      <Image
        src={imageSrc}
        alt="Air Quality Icon"
        width={80}
        height={80}
        loading="eager"
      />
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
