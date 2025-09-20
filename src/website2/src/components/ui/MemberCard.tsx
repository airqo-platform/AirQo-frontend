'use client';

import PlaceholderImage from '@public/assets/images/placeholder.webp';
import DOMPurify from 'dompurify';
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
import { useApiData } from '@/services/hooks/useApiData';
import { convertDeltaToHtml } from '@/utils/quillUtils';

// Define types for member data
interface Member {
  // list response fields (may vary between board/team)
  id?: string | number;
  public_identifier?: string;
  api_url?: string;
  name?: string;
  title?: string;
  picture_url?: string;
  picture?: string;
  bio?: string;
  about?: string;
  descriptions?: { id?: number; description?: string }[];
  twitter?: string | null;
  linked_in?: string | null;
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
  // When dialog opens, fetch detailed member data if a public_identifier or id is available
  const identifier = member.public_identifier || member.id;

  const { data: detailData } = useApiData<any>(
    identifier
      ? member.public_identifier
        ? `team-members/${identifier}`
        : `board-members/${identifier}`
      : null,
  );

  const detailed = React.useMemo(() => {
    if (!detailData) return member;
    if (Array.isArray(detailData)) return detailData[0] || member;
    if (
      (detailData as any).results &&
      Array.isArray((detailData as any).results)
    )
      return (detailData as any).results[0] || member;
    return detailData;
  }, [detailData, member]);

  const renderContent = (content?: string) => {
    const raw = (content || '').trim();
    const isHtml = raw.startsWith('<');
    const html = isHtml ? raw : convertDeltaToHtml(raw);
    return DOMPurify.sanitize(html);
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
              src={
                (detailed as any).picture_url ||
                (detailed as any).picture ||
                PlaceholderImage
              }
              alt={(detailed as any).name || ''}
              fill
              sizes="(max-width: 640px) 100vw, 300px"
              className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
            />
          </div>

          {/* Name and Title */}
          <div className="w-full text-left">
            <h3
              className="text-lg font-semibold leading-tight truncate"
              title={(detailed as any).name || ''}
            >
              {(detailed as any).name}
            </h3>
            <p
              className="text-gray-600 text-sm leading-snug truncate"
              title={(detailed as any).title || ''}
            >
              {(detailed as any).title}
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
            {(detailed as any).twitter && (
              <a
                href={(detailed as any).twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 transition"
              >
                <FaTwitter size={20} />
              </a>
            )}
            {(detailed as any).linked_in && (
              <a
                href={(detailed as any).linked_in}
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
                src={
                  (detailed as any).picture_url ||
                  (detailed as any).picture ||
                  PlaceholderImage
                }
                alt={(detailed as any).name || ''}
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
                {(detailed as any).descriptions?.length
                  ? (detailed as any).descriptions.map(
                      (desc: any, idx: number) => (
                        <p key={idx} className="mb-2">
                          {desc.description}
                        </p>
                      ),
                    )
                  : null}

                {(detailed as any).bio && (
                  <div
                    className="mb-2"
                    dangerouslySetInnerHTML={{
                      __html: renderContent((detailed as any).bio),
                    }}
                  />
                )}

                {/* If no descriptions and no bio */}
                {!(detailed as any).bio &&
                  (!(detailed as any).descriptions ||
                    (detailed as any).descriptions.length === 0) && (
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
