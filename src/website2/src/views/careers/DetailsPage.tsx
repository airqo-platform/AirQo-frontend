'use client';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

import { CustomButton, NoData } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useCareerDetail } from '@/hooks/useApiHooks';

const DetailsPage: React.FC<{ id: string }> = ({ id }) => {
  const { data: careerDetails, isLoading, error } = useCareerDetail(id);

  const router = useRouter();
  if (isLoading) {
    return (
      <div className={`${mainConfig.containerClass} p-8`}>
        {' '}
        {/* Skeleton for the Header */}{' '}
        <div className="mb-8">
          {' '}
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4 animate-pulse"></div>{' '}
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4 animate-pulse"></div>{' '}
          <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>{' '}
        </div>{' '}
        {/* Skeleton for Job Details */}{' '}
        <div>
          {' '}
          <div className="h-7 bg-gray-300 rounded w-2/3 mb-6 animate-pulse"></div>{' '}
          <div className="space-y-4">
            {' '}
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="h-4 bg-gray-300 rounded w-full animate-pulse"
              ></div>
            ))}{' '}
          </div>{' '}
        </div>{' '}
        {/* Skeleton for the Apply Button */}{' '}
        <div className="mt-8 text-center">
          {' '}
          <div className="h-10 bg-gray-300 rounded w-40 mx-auto animate-pulse"></div>{' '}
        </div>{' '}
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-xl text-red-500 p-8">
        {' '}
        Unable to load career details. Please try again later.{' '}
      </div>
    );
  }
  if (!careerDetails) {
    return <NoData />;
  }
  return (
    <div
      className={`${mainConfig.containerClass} w-full p-8 bg-white border border-gray-200 rounded-lg mt-6`}
    >
      {' '}
      {/* Back Button */}{' '}
      <div className="mb-4">
        {' '}
        <CustomButton
          onClick={() => router.back()}
          className="text-black bg-transparent p-0 m-0 flex items-center"
        >
          {' '}
          <FiArrowLeft className="mr-2" size={20} /> Back{' '}
        </CustomButton>{' '}
      </div>{' '}
      {/* Header Section */}{' '}
      <header className="mb-8">
        {' '}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {' '}
          {careerDetails.title}{' '}
        </h1>{' '}
        <div className="space-y-2">
          {' '}
          <p className="text-lg text-gray-700">
            {' '}
            Job Type: {careerDetails.type}{' '}
          </p>{' '}
          <p className="text-lg text-gray-700">
            Closing Date:{' '}
            {careerDetails.closing_date
              ? format(new Date(careerDetails.closing_date), 'PPP')
              : 'N/A'}
          </p>
        </div>{' '}
      </header>{' '}
      {/* Job Details Section */}{' '}
      <section className="space-y-6">
        {' '}
        {/* Job Descriptions */}{' '}
        {careerDetails.descriptions &&
          careerDetails.descriptions.length > 0 && (
            <div className="space-y-4">
              {' '}
              <h2 className="text-2xl font-semibold text-gray-900">
                Job Description
              </h2>{' '}
              {careerDetails.descriptions.map((desc: any, index: number) => (
                <div
                  key={index}
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: desc.description || '' }}
                />
              ))}{' '}
            </div>
          )}{' '}
        {/* Bullet Points */}{' '}
        {careerDetails.bullets && careerDetails.bullets.length > 0 && (
          <div className="space-y-6">
            {' '}
            {careerDetails.bullets.map((bulletSection: any, index: number) => (
              <div key={index} className="space-y-3">
                {' '}
                <h3 className="text-xl font-semibold text-gray-900">
                  {' '}
                  {bulletSection.name}{' '}
                </h3>{' '}
                {bulletSection.bullet_points &&
                  bulletSection.bullet_points.length > 0 && (
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {' '}
                      {bulletSection.bullet_points.map(
                        (point: any, pointIndex: number) => (
                          <li key={pointIndex} className="leading-relaxed">
                            {' '}
                            {point.point}{' '}
                          </li>
                        ),
                      )}{' '}
                    </ul>
                  )}{' '}
              </div>
            ))}{' '}
          </div>
        )}{' '}
        {/* Fallback if no descriptions or bullets */}{' '}
        {(!careerDetails.descriptions ||
          careerDetails.descriptions.length === 0) &&
          (!careerDetails.bullets || careerDetails.bullets.length === 0) && (
            <div className="text-gray-600 italic">
              {' '}
              No detailed job description available at this time.{' '}
            </div>
          )}{' '}
      </section>{' '}
      {/* Apply Button */}{' '}
      {careerDetails.apply_url && (
        <footer className="mt-12 text-left">
          {' '}
          <CustomButton
            onClick={() => window.open(careerDetails.apply_url, '_blank')}
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            {' '}
            Apply Now{' '}
          </CustomButton>{' '}
        </footer>
      )}{' '}
    </div>
  );
};
export default DetailsPage;
