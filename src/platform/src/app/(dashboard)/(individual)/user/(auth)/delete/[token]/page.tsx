'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui';
import { useConfirmAccountDeletion } from '@/shared/hooks';
import { useLogout } from '@/shared/hooks';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { AqCheckCircle, AqXCircle } from '@airqo/icons-react';

interface ConfirmDeletePageProps {
  params: {
    token: string;
  };
}

const ConfirmDeletePage: React.FC<ConfirmDeletePageProps> = ({ params }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { trigger: confirmDeletion } = useConfirmAccountDeletion();
  const logout = useLogout();

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        await confirmDeletion({ token: params.token });
        setStatus('success');
        setMessage('Your account has been successfully deleted.');
        // Wait a moment then logout
        setTimeout(async () => {
          await logout();
        }, 2000);
      } catch (error) {
        setStatus('error');
        const errorMessage = getUserFriendlyErrorMessage(error);
        setMessage(errorMessage);
      }
    };

    handleConfirmation();
  }, [params.token, confirmDeletion, logout]);

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  Confirming Account Deletion
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Please wait while we process your request...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <AqCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  Account Deleted
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  {message}
                </p>
                <p className="mt-4 text-center text-sm text-gray-500">
                  You will be redirected shortly...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AqXCircle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                  Deletion Failed
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  {message}
                </p>
                <div className="mt-6">
                  <Button onClick={handleGoHome} className="w-full">
                    Go to Home
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeletePage;
