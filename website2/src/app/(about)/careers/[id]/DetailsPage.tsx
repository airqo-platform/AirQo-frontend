'use client';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';

import { CustomButton, NoData } from '@/components/ui';
import { getCareerDetails } from '@/services/apiService';

const DetailsPage: React.FC<any> = ({ id }) => {
  const [career, setCareer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCareerDetails = async () => {
      try {
        const careerData = await getCareerDetails(id);
        setCareer(careerData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching career details:', error);
        setError('Unable to load career details');
        setLoading(false);
      }
    };

    fetchCareerDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        {/* Skeleton for the Header */}
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-1/3 animate-pulse"></div>
        </div>

        {/* Skeleton for Job Details */}
        <div>
          <div className="h-7 bg-gray-300 rounded w-2/3 mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="h-4 bg-gray-300 rounded w-full animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Skeleton for the Apply Button */}
        <div className="mt-8 text-center">
          <div className="h-10 bg-gray-300 rounded w-40 mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-xl text-red-500 p-8">{error}</div>;
  }

  if (!career) {
    return <NoData />;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white border border-gray-200 rounded-lg mt-6">
      {/* Back Button */}
      <div className="mb-4">
        <CustomButton
          onClick={() => router.back()}
          className="text-black bg-transparent p-0 m-0 flex items-center"
        >
          <FiArrowLeft className="mr-2" size={20} />
          Back
        </CustomButton>
      </div>

      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {career.title}
        </h1>
        <div className="space-y-2">
          <p className="text-lg text-gray-700">Job Type: {career.type}</p>
          <p className="text-lg text-gray-700">
            Closing Date: {format(new Date(career.closing_date), 'PPP')}
          </p>
        </div>
      </header>

      {/* Job Details Section */}
      <section>
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: career.career_details }}
        />
      </section>

      {/* Apply Button */}
      <footer className="mt-12 text-left">
        <CustomButton
          onClick={() => window.open(career.apply_url, '_blank')}
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold"
        >
          Apply Now
        </CustomButton>
      </footer>
    </div>
  );
};

export default DetailsPage;
