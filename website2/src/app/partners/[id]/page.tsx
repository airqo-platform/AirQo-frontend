'use client';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';

import { usePartnerDetails } from '@/hooks/useApiHooks';

const PartnerDetailsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const { data: partner, isLoading, isError } = usePartnerDetails(id);

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="animate-pulse w-full h-full bg-white">
      <div className="relative w-full h-64 md:h-96 bg-gray-200" />
      <div className="max-w-5xl mx-auto mt-12 p-6 bg-gray-200 rounded-md h-40" />
      <div className="max-w-5xl mx-auto mt-12 p-8 bg-gray-200 rounded-md h-64" />
      <div className="max-w-5xl mx-auto mt-12 p-6 bg-gray-200 rounded-md h-12" />
    </div>
  );

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <SkeletonLoader />
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <p className="text-red-500 text-xl">Failed to load partner details.</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Handle case when partner data is not found
  if (!partner) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <p className="text-gray-500 text-xl">Partner not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-100 py-6">
      {/* Banner Section */}
      {partner.partner_image_url && (
        <div className="relative w-full h-64 md:h-96 bg-black">
          <Image
            src={partner.partner_image_url}
            alt={`${partner.partner_name} Banner`}
            fill
            className="w-full h-full object-cover"
            priority
          />
        </div>
      )}

      {/* Details Section */}
      <div className="max-w-5xl mx-auto mt-12 p-6 bg-white shadow-sm rounded-lg flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-6">
        {/* Partner Logo */}
        {partner.partner_logo_url && (
          <div className="w-40 h-40 relative">
            <Image
              src={partner.partner_logo_url}
              alt={`${partner.partner_name} Logo`}
              fill
              className="rounded object-contain"
            />
          </div>
        )}

        {/* Partner Name and Type */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">{partner.partner_name}</h1>
          <p className="text-lg text-gray-600 capitalize">{partner.type}</p>
        </div>
      </div>

      {/* Descriptions Section */}
      <div className="max-w-5xl mx-auto mt-12 p-8 bg-white shadow-sm rounded-lg">
        <h2 className="text-3xl font-semibold mb-6">
          About {partner.partner_name}
        </h2>
        {partner.descriptions && partner.descriptions.length > 0 ? (
          partner.descriptions.map((desc: any) => (
            <p key={desc.id} className="text-gray-700 mb-4 leading-relaxed">
              {desc.description}
            </p>
          ))
        ) : (
          <p className="text-gray-500">
            No descriptions available for this partner.
          </p>
        )}
      </div>

      {/* Back Button */}
      <div className="max-w-5xl mx-auto p-6 mt-12 text-center">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default PartnerDetailsPage;
