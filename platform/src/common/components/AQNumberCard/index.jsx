import GoodAir from '@/icons/Charts/GoodAir';
import Hazardous from '@/icons/Charts/Hazardous';
import Moderate from '@/icons/Charts/Moderate';
import Unhealthy from '@/icons/Charts/Unhealthy';
import UnhealthySG from '@/icons/Charts/UnhealthySG';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import UnknownAQ from '@/icons/Charts/Invalid';
import WindIcon from '@/icons/Common/wind.svg';
import CustomTooltip from '../Tooltip';
import { useWindowSize } from '@/lib/windowSize';
import TrendDownIcon from '@/icons/Analytics/trendDownIcon';
import PropTypes from 'prop-types';

const AQNumberCard = ({
  reading,
  location,
  country,
  pollutant,
  count,
  locationFullName,
  isLoading = false,
  handleClick,
}) => {
  const airQualityLevels = [
    { max: 12, text: 'Air Quality is Good', icon: GoodAir },
    { max: 35.4, text: 'Air Quality is Moderate', icon: Moderate },
    {
      max: 55.4,
      text: 'Air Quality is Unhealthy for Sensitive Groups',
      icon: UnhealthySG,
    },
    { max: 150.4, text: 'Air Quality is Unhealthy', icon: Unhealthy },
    { max: 250.4, text: 'Air Quality is Very Unhealthy', icon: VeryUnhealthy },
    { max: 500, text: 'Air Quality is Hazardous', icon: Hazardous },
  ];

  const { width: windowWidth } = useWindowSize();

  // Determine the air quality text and icon based on the reading value
  const { text: airQualityText, icon: AirQualityIcon } = airQualityLevels.find(
    (level) => reading <= level.max,
  ) || { text: 'Air Quality is Unknown', icon: UnknownAQ };

  return (
    <button
      onClick={handleClick}
      className={`relative flex-col justify-start items-center ${
        count <= 2
          ? 'w-full md:min-w-[200px] md:max-w-[50%] float-left'
          : 'w-full'
      } ${isLoading ? 'animate-pulse' : ''}`}
    >
      <div className="w-full  border b-secondary-neutral-light-100 bg-white rounded-xl px-4 py-2">
        <div className="flex justify-between items-center h-[68.48px]">
          {/* Location Info */}
          <div>
            <div
              className="text-gray-700 text-base font-medium leading-normal capitalize"
              title={locationFullName}
            >
              {location.length > 17 ? `${location.slice(0, 17)}...` : location}
            </div>
            <div className="text-sm text-slate-400 capitalize">{country}</div>
          </div>

          {/* Trend Info */}
          <div className="bg-green-50 text-green-500 pl-[8px] pr-[4px] rounded-xl text-sm flex items-center gap-2">
            <TrendDownIcon fill="#12B76A" />
            <span>{'32%'}</span>
          </div>
        </div>

        {/* Air Quality Info */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1">
              <div className="p-[2.62px] bg-slate-100 rounded-full flex items-center justify-center">
                <WindIcon width="10.48px" height="10.48px" />
              </div>
              <div className="text-slate-400 text-sm font-medium">
                {pollutant === 'pm2_5' ? 'PM2.5' : 'PM10'}
              </div>
            </div>
            <div className="text-gray-700 text-[28px] font-extrabold">
              {typeof reading === 'number' ? reading.toFixed(2) : reading}
            </div>
          </div>

          {/* Air Quality Icon with Tooltip */}
          <div className="relative">
            <CustomTooltip
              tooltipsText={airQualityText}
              position={windowWidth > 1024 ? 'top' : 'left'}
            >
              <div className="w-16 h-16 flex">
                {AirQualityIcon && <AirQualityIcon />}
              </div>
            </CustomTooltip>
          </div>
        </div>
      </div>
    </button>
  );
};

AQNumberCard.propTypes = {
  reading: PropTypes.number,
  location: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired,
  pollutant: PropTypes.string.isRequired,
  count: PropTypes.number,
  locationFullName: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  handleClick: PropTypes.func,
};

export default AQNumberCard;
