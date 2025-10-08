import { AqAnnouncement01 } from '@airqo/icons-react';
import Link from 'next/link';

const AnnouncementCard = () => {
  return (
    <div className="self-stretch rounded-lg border border-gray-100 bg-white pt-6 px-2 pb-8 hover:cursor-pointer ">
      <Link href="/user/creation">
        <AqAnnouncement01 />
      </Link>
    </div>
  );
};

export default AnnouncementCard;
