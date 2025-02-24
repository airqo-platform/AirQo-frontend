'use client';

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
} from '@/components/ui';
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
  twitter?: string;
  linked_in?: string;
}

interface MemberCardProps {
  member: Member;
  btnText?: string;
  cardClassName?: string;
}

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  btnText = 'Read Bio',
  cardClassName,
}) => {
  const renderContent = (content: string) => {
    const isHtml = content?.trim().startsWith('<');
    return convertDeltaToHtml(isHtml ? content : convertDeltaToHtml(content));
  };

  return (
    <Dialog>
      {/* TRIGGER (Card) */}
      <DialogTrigger asChild>
        <div
          className={cn(
            'max-w-xs w-full flex flex-col items-center space-y-2 rounded-md shadow-md cursor-pointer p-3 bg-white',
            cardClassName,
          )}
        >
          {/*
            Extremely tall image container (3050px), with rounded edges.
            Also applying 'mt-[-20px]' to push the container up slightly.
          */}
          <div className="relative w-full h-[350px] rounded-xl overflow-hidden mt-[-20px]">
            <Image
              src={member.picture_url || member.picture || PlaceholderImage}
              alt={member.name}
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
            />
          </div>

          {/* Name and Title */}
          <div className="w-full text-left">
            <h3
              className="text-lg font-semibold leading-tight truncate"
              title={member.name}
            >
              {member.name}
            </h3>
            <p
              className="text-gray-600 text-sm leading-snug truncate"
              title={member.title}
            >
              {member.title}
            </p>
          </div>

          {/* Read Bio Button */}
          {btnText && (
            <span className="text-sm text-blue-500 hover:underline self-start">
              {btnText}
            </span>
          )}

          {/* Social Icons */}
          <div className="flex items-center space-x-3 self-start mt-1">
            {member.twitter && (
              <a
                href={member.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 transition"
              >
                <FaTwitter size={20} />
              </a>
            )}
            {member.linked_in && (
              <a
                href={member.linked_in}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 transition"
              >
                <FaLinkedinIn size={20} />
              </a>
            )}
          </div>
        </div>
      </DialogTrigger>

      {/* DIALOG CONTENT */}
      <DialogContent className="sm:max-w-[1024px] w-full p-4 md:p-6 overflow-hidden">
        <div className="flex flex-col gap-2">
          {/* Header Section */}
          <DialogHeader className="p-0">
            <DialogTitle className="text-2xl font-semibold">
              {member.name}
            </DialogTitle>
            <p className="text-base text-gray-500">{member.title}</p>

            {/* Optional Social Media Icons in the dialog header */}
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
          </DialogHeader>

          <Divider className="my-2" />

          {/* Main Content: Image + Bio */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Dialog Image */}
            <div className="flex-shrink-0 w-full lg:w-[300px] h-[300px] lg:h-auto overflow-hidden rounded-lg">
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

            {/* Description with scroll if content is long */}
            <div className="flex-1 max-h-[50vh] md:max-h-[60vh] overflow-y-auto pr-2">
              <DialogDescription className="leading-relaxed">
                {member.descriptions?.length
                  ? member.descriptions.map((desc, idx) => (
                      <p key={idx} className="mb-2">
                        {desc.description}
                      </p>
                    ))
                  : null}

                {member.bio && (
                  <div
                    className="mb-2"
                    dangerouslySetInnerHTML={{
                      __html: renderContent(member.bio),
                    }}
                  />
                )}

                {/* If no descriptions and no bio */}
                {!member.bio &&
                  (!member.descriptions ||
                    member.descriptions.length === 0) && (
                    <p className="text-gray-500">Bio is not available.</p>
                  )}
              </DialogDescription>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberCard;
