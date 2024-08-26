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
import TrendUpIcon from '@/icons/Analytics/trendUpIcon';
import TrendDownIcon from '@/icons/Analytics/trendDownIcon';
import LongArrowRight from '@/icons/Analytics/longArrowRight';
import PropTypes from 'prop-types';
import Button from '../Button';

const AQNumberCard = ({
  reading,
  location,
  country,
  pollutant,
  count,
  locationFullName,
  isLoading = false,
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

  const { text: airQualityText, icon: AirQualityIcon } = airQualityLevels.find(
    (level) => reading <= level.max,
  ) || { text: 'Air Quality is Unknown', icon: UnknownAQ };

  const windowWidth = useWindowSize().width;

  return (
    <Button
      type="button"
      paddingStyles="p-0 m-0"
      onClick={null}
      className={`${
        count <= 2
          ? 'w-full md:min-w-[200px] md:max-w-[50%] float-left'
          : 'w-full'
      } ${isLoading && 'animate-pulse'}  relative h-[164.48px] flex-col justify-start items-center inline-flex`}
    >
      <div className="border border-gray-200 rounded-xl overflow-hidden w-full">
        <div className="self-stretch w-full h-[68.48px] px-4 pt-3.5 pb-[10.48px] bg-white flex-col justify-start items-start flex">
          <div className="self-stretch justify-between items-start inline-flex">
            <div className="flex-col justify-start items-start inline-flex">
              <div
                className="text-gray-700 text-base font-medium leading-normal whitespace-nowrap overflow-ellipsis capitalize"
                title={locationFullName}
              >
                {location.length > 17
                  ? `${location.slice(0, 17)}...`
                  : location}
              </div>
              <div className="text-sm text-slate-400 capitalize">{country}</div>
            </div>
            <div
              className={`bg-green-50 text-green-500 pl-[8px] pr-[4px] rounded-xl text-sm flex items-center gap-2`}
            >
              <TrendDownIcon fill="#12B76A" />
              <span>{'32%'}</span>
            </div>
          </div>
        </div>
        <div className="self-stretch w-full pl-4 pr-5 py-4 bg-white justify-between items-center inline-flex gap-4">
          <div className="flex-col justify-start items-start gap-0.5 inline-flex">
            <div className="flex-col justify-start items-start gap-0.5 flex">
              <div className="justify-start items-center gap-0.5 inline-flex">
                <div className="p-[2.62px] bg-slate-100 rounded-[18.35px] justify-center items-center flex">
                  <WindIcon width="10.48px" height="10.48px" />
                </div>
                <div className="text-slate-400 text-sm font-medium leading-tight">
                  {pollutant === 'pm2_5' ? 'PM2.5' : 'PM10'}
                </div>
              </div>
              <div className="text-gray-700 text-[28px] font-extrabold leading-7">
                {typeof reading === 'number' ? reading.toFixed(2) : reading}
              </div>
            </div>
          </div>
          <div className="absolute right-3 bottom-1 z-10">
            <CustomTooltip
              tooltipsText={airQualityText}
              position={windowWidth > 1024 ? 'top' : 'left'}
            >
              <div className="w-16 h-16 justify-center items-center flex">
                {AirQualityIcon && <AirQualityIcon />}
              </div>
            </CustomTooltip>
          </div>
        </div>
      </div>
    </Button>
  );
};

AQNumberCard.propTypes = {
  reading: PropTypes.number,
  location: PropTypes.string,
  country: PropTypes.string,
  pollutant: PropTypes.string,
  count: PropTypes.number,
  locationFullName: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default AQNumberCard;
