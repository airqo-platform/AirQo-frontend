import ContentBox from '@/components/Layout/content_box';
import MoreHorizIcon from '@/icons/Common/more_horiz.svg';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Box = ({ title, subtitle, contentLink, isBigTitle, children }) => {
  const router = useRouter();

  return (
    <ContentBox>
      <div className='flex flex-col w-full'>
        <div className='flex justify-between md:items-center py-6'>
          <div className='ml-6'>
            <h3 className={`${isBigTitle ? 'text-xl mb-1' : 'text-sm'} font-semibold`}>{title}</h3>
            <p className='text-sm text-black-900 opacity-80 md:max-w-[75%]'>
              {subtitle}{' '}
              {contentLink && (
                <span className='text-link-blue'>
                  <Link href={contentLink}>Read more</Link>
                </span>
              )}
            </p>
          </div>
          <div className='w-10 h-10 p-2 flex justify-center items-center border border-grey-200 rounded-lg mr-6'>
            <MoreHorizIcon />
          </div>
        </div>
        <hr className='bg-skeleton h-[0.5px] w-full mb-6' />
        <>{children}</>
      </div>
    </ContentBox>
  );
};

export default Box;
