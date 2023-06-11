import ContentBox from '@/components/Layout/content_box';
import MoreHorizIcon from '@/icons/Common/more_horiz.svg';
import Button from '@/components/Button';
import Link from 'next/link';
import { isEmpty } from 'underscore';
import { useRouter } from 'next/router';

const Box = ({
  title,
  subtitle,
  contentLink,
  isBigTitle,
  children,
  contentLinkText,
  dropdownItems,
}) => {
  const router = useRouter();
  return (
    <ContentBox>
      <div className='flex flex-col w-full'>
        <div className='flex justify-between md:items-center py-6'>
          <div className='ml-6'>
            <h3 className={`${isBigTitle ? 'text-xl mb-1' : 'text-sm'} font-semibold`}>{title}</h3>
            <p className='text-sm text-black-900 opacity-80 md:max-w-[75%]'>
              {subtitle}{' '}
              {!isEmpty(contentLink) && (
                <span className='text-link-blue'>
                  <Link href={contentLink}>{contentLinkText || 'Read more'}</Link>
                </span>
              )}
            </p>
          </div>
          <div className='mr-6'>
            <div className='dropdown dropdown-end'>
              <label
                tabIndex={0}
                className='border border-grey-200 rounded-lg btn btn-sm btn-square btn-outline hover:bg-transparent m-1'
              >
                <MoreHorizIcon />
              </label>
              {dropdownItems && (
                <ul
                  tabIndex={0}
                  className='dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52'
                >
                  {dropdownItems.map((item, index) => {
                    if (item.type === 'path') {
                      return (
                        <li>
                          <a onClick={() => router.push(item.link)}>{item.label}</a>
                        </li>
                      );
                    }

                    if (item.type === 'event') {
                      return (
                        <li>
                          <a onClick={item.event}>{item.label}</a>
                        </li>
                      );
                    }
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
        <hr className='bg-skeleton h-[0.5px] w-full mb-6' />
        <>{children}</>
      </div>
    </ContentBox>
  );
};

export default Box;
