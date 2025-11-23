'use client';

import PlaceholderImage from '@public/assets/images/placeholder.webp';
import DOMPurify from 'dompurify';
import Image from 'next/image';
import React, { useState } from 'react';
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

import AvatarFallback from './AvatarFallback';

// Define types for member data
interface Member {
  // list response fields (may vary between board/team)
  id?: string | number;
  public_identifier?: string;
  api_url?: string;
  name?: string;
  title?: string; // Generic title field
  role?: string; // Team members might use this
  position?: string; // Board members use this
  picture_url?: string;
  picture?: string;
  image?: string; // Another common field name
  bio?: string;
  about?: string;
  bio_description?: string;
  description?: string;
  descriptions?: { id?: number; description?: string }[];
  twitter?: string | null;
  linked_in?: string | null;
  linkedin?: string | null; // Alternative field name
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
  // Use the member data directly (no additional fetching needed)
  const [imageError, setImageError] = useState(false);
  const [dialogImageError, setDialogImageError] = useState(false);

  const renderContent = (content?: string) => {
    if (!content) return '';

    const html = convertDeltaToHtml(content);
    if (html && html.trim()) {
      return DOMPurify.sanitize(html);
    }

    // Fallback to plain text if conversion returns empty
    if (typeof content === 'string') {
      const raw = content.trim();
      return raw ? DOMPurify.sanitize(`<p>${raw}</p>`) : '';
    }
    return '';
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
            {imageError ? (
              <AvatarFallback
                name={member.name}
                className="w-full h-full text-4xl"
              />
            ) : (
              <Image
                src={
                  member.picture_url ||
                  member.picture ||
                  member.image ||
                  PlaceholderImage
                }
                alt={member.name || 'Team member'}
                fill
                sizes="(max-width: 640px) 100vw, 300px"
                className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* Name and Title */}
          <div className="w-full text-left">
            <h3
              className="text-lg font-semibold leading-tight truncate"
              title={member.name || ''}
            >
              {member.name}
            </h3>
            <p
              className="text-gray-600 text-sm leading-snug truncate"
              title={member.title || member.role || member.position || ''}
            >
              {member.title || member.role || member.position}
            </p>
          </div>

          {/* Read Bio Button */}
          {btnText && (
            <span className="text-sm text-blue-500 hover:underline self-start">
              {member.descriptions?.length ||
              member.bio ||
              member.about ||
              member.bio_description ||
              member.description
                ? btnText
                : 'View Profile'}
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
            {(member.linked_in || member.linkedin) && (
              <a
                href={member.linked_in || member.linkedin || ''}
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
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] lg:max-w-[900px] xl:max-w-[1024px] p-3 sm:p-4 md:p-6 overflow-hidden">
        <div className="flex flex-col gap-2 h-full">
          {/* Header Section */}
          <DialogHeader className="p-0 flex-shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-semibold">
              {member.name}
            </DialogTitle>
            <p className="text-sm sm:text-base text-gray-500">
              {member.title || member.role || member.position}
            </p>

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
              {(member.linked_in || member.linkedin) && (
                <a
                  href={member.linked_in || member.linkedin || ''}
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
          <div className="flex flex-col sm:flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
            {/* Dialog Image */}
            <div className="flex-shrink-0 w-full sm:w-full lg:w-[280px] h-[200px] sm:h-[250px] lg:h-[280px] mx-auto lg:mx-0 overflow-hidden rounded-lg">
              {dialogImageError ? (
                <AvatarFallback
                  name={member.name}
                  className="w-full h-full text-6xl"
                />
              ) : (
                <Image
                  src={
                    member.picture_url ||
                    member.picture ||
                    member.image ||
                    PlaceholderImage
                  }
                  alt={member.name || 'Team member'}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={() => setDialogImageError(true)}
                />
              )}
            </div>

            {/* Description with scroll if content is long */}
            <div className="flex-1 max-h-[40vh] sm:max-h-[45vh] lg:max-h-[50vh] overflow-y-auto pr-2">
              <DialogDescription className="leading-relaxed">
                {member.descriptions?.length ? (
                  member.descriptions.map((desc: any, idx: number) => (
                    <p key={idx} className="mb-2">
                      {desc.description}
                    </p>
                  ))
                ) : !(
                    member.bio ||
                    member.about ||
                    member.bio_description ||
                    member.description
                  ) ? (
                  <p className="text-gray-500">Bio is not available.</p>
                ) : null}

                {/* Check multiple possible bio fields as fallback */}
                {(member.bio ||
                  member.about ||
                  member.bio_description ||
                  member.description) && (
                  <div
                    className="mb-2"
                    dangerouslySetInnerHTML={{
                      __html: renderContent(
                        member.bio ||
                          member.about ||
                          member.bio_description ||
                          member.description,
                      ),
                    }}
                  />
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
