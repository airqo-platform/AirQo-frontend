import PlaceholderImage from '@public/assets/images/placeholder.webp';
import Image from 'next/image';
import React from 'react';
import { FaLinkedinIn, FaTwitter } from 'react-icons/fa';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Divider,
} from '@/components/ui/';
import { cn } from '@/lib/utils';
import { convertDeltaToHtml } from '@/utils/quillUtils';

// Define types for member data
interface Member {
  name: string;
  title: string;
  picture_url: string;
  picture: string;
  bio: string;
  descriptions: { description: string }[];
  twitter?: string; // Optional field
  linked_in?: string; // Optional field
}

interface MemberCardProps {
  member: Member;
  btnText?: string; // Button text is now customizable
  cardClassName?: string; // Allow customization for the outer card div
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  btnText = '',
  cardClassName,
}) => {
  const renderContent = (content: string) => {
    const isHtml = content?.trim().startsWith('<');
    return convertDeltaToHtml(isHtml ? content : convertDeltaToHtml(content));
  };

  return (
    <Dialog>
      {/* Trigger for opening the dialog */}
      <DialogTrigger asChild>
        <div
          className={cn(
            'flex flex-col items-center space-y-4 cursor-pointer mx-auto max-w-[300px]',
            cardClassName,
          )}
        >
          {/* Image and hover effect with default placeholder */}
          <div className="w-auto h-[390px] overflow-hidden rounded-lg">
            <Image
              src={member.picture_url || PlaceholderImage}
              alt={member.name}
              width={295}
              height={390}
              loading="eager"
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out transform hover:scale-105"
            />
          </div>

          {/* Member Name, Title, Read Bio Button, and Social Media Icons */}
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col items-start space-y-2 text-left">
              <h3
                className="text-xl font-bold max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis"
                title={member.name}
              >
                {member.name}
              </h3>
              <p
                className="text-gray-500 max-w-[200px] overflow-hidden whitespace-nowrap text-ellipsis"
                title={member.title}
              >
                {member.title}
              </p>
              {btnText && (
                <button className="text-sm text-blue-500 hover:underline mt-2">
                  {btnText}
                </button>
              )}
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-2">
              {member.twitter && (
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 transition"
                >
                  <FaTwitter size={24} />
                </a>
              )}
              {member.linked_in && (
                <a
                  href={member.linked_in}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 transition"
                >
                  <FaLinkedinIn size={24} />
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogTrigger>

      {/* Dialog Content Section */}
      <DialogContent className="max-w-[1024px] p-6">
        {/* Header Section */}
        <DialogHeader>
          <div className="flex flex-col items-start gap-4 mt-4">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {member.name}
              </DialogTitle>
              <p className="text-lg text-gray-500">{member.title}</p>
            </div>
            {/* Optional Social Media Icons in the Dialog */}
            <div className="flex items-center space-x-2">
              {member.twitter && (
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 transition"
                >
                  <FaTwitter size={24} />
                </a>
              )}
              {member.linked_in && (
                <a
                  href={member.linked_in}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 transition"
                >
                  <FaLinkedinIn size={24} />
                </a>
              )}
            </div>
          </div>
        </DialogHeader>

        <Divider className="h-1" />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Image in Dialog */}
          <div className="flex-shrink-0 w-full lg:w-[300px] h-[300px] lg:h-full overflow-hidden rounded-lg">
            <Image
              src={member.picture_url || member.picture || PlaceholderImage}
              alt={member.name}
              width={300}
              height={300}
              className="w-full h-full object-cover"
              placeholder="blur"
              blurDataURL="/placeholder-image.jpg"
              loading="eager"
            />
          </div>

          {/* Descriptions */}
          <div className="flex-1">
            <DialogDescription className="leading-relaxed max-h-[400px] overflow-y-auto">
              {member.descriptions &&
                member.descriptions.map((desc, idx) => (
                  <p key={idx}>{desc.description}</p>
                ))}
              {member.bio && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderContent(member.bio),
                  }}
                ></div>
              )}

              {/* if both are empty */}
              {!member.bio && !member.descriptions && (
                <p className="text-gray-500">Bio is not available.</p>
              )}
            </DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberCard;
