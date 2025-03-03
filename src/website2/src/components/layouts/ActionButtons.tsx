'use client';
import { useTranslations } from 'next-intl';

import mainConfig from '@/configs/mainConfigs';
import { useDispatch } from '@/hooks';
import { useRouter } from '@/navigation';
import { openModal } from '@/store/slices/modalSlice';

import { CustomButton } from '../ui';

const ActionButtons = () => {
  const t = useTranslations('actionButtons');
  const router = useRouter();
  const dispatch = useDispatch();
  return (
    <div
      className={`flex flex-col md:flex-row gap-6 w-full ${mainConfig.containerClass}`}
    >
      {/* Card 1 */}
      <CustomButton
        onClick={() => {
          router.push('/explore-data');
        }}
        className="bg-transparent p-0 m-0"
      >
        <div className="flex flex-col justify-between bg-blue-600 items-start text-start text-white md:rounded-xl p-8 w-full cursor-pointer transform transition-transform duration-300 focus:outline-none">
          <div>
            <h3 className="text-2xl font-medium mb-4">
              {t('exploreData.title')}
            </h3>
          </div>
          <p className="mt-4 text-lg hover:underline">
            {t('exploreData.action')} →
          </p>
        </div>
      </CustomButton>

      {/* Card 2 */}
      <CustomButton
        onClick={() => {
          dispatch(openModal());
        }}
        className="bg-transparent p-0 m-0"
      >
        <div className="flex flex-col justify-between items-start text-start bg-blue-50 text-blue-600 md:rounded-xl p-8 w-full cursor-pointer transform transition-transform duration-300 focus:outline-none">
          <div>
            <h3 className="text-2xl font-medium mb-4">
              {t('getInvolved.title')}
            </h3>
          </div>
          <p className="mt-4 text-lg hover:underline">
            {t('getInvolved.action')} →
          </p>
        </div>
      </CustomButton>
    </div>
  );
};

export default ActionButtons;
