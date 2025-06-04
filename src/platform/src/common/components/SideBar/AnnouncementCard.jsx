import Announcement from '@/icons/SideBar/announcement_card.svg';
import Link from 'next/link';

const AnnouncementCard = () => {
  return (
    <div className="self-stretch rounded-lg border border-gray-100 bg-white pt-6 px-2 pb-8 hover:cursor-pointer ">
      <Link href="/user/creation">
        <Announcement />
      </Link>
    </div>
  );
};

export default AnnouncementCard;
