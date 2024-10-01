'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React, { useState, ReactNode } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { ScaleLoader } from 'react-spinners';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AirQoLogo from '@/public/images/airqo.png';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' })
    .max(50, { message: 'Password must be at most 50 characters long.' }),
});

type LoginFormSchema = z.infer<typeof loginSchema>;

interface FormComponentProps {
  children: ReactNode;
  btnText: string;
}

const Index: React.FC<FormComponentProps> = ({ children, btnText }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formMethods = useForm<LoginFormSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmitData = async (data: LoginFormSchema) => {
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        ...data,
      });

      if (result?.status === 200) {
        toast.success('Successfully logged in, redirecting...', {
          style: { background: 'green', color: 'white', border: 'none' },
          position: 'top-center',
        });
        router.push('/home');
      } else {
        throw new Error(result?.error || 'Login failed, please try again.');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed, please try again.';
      toast.error(errorMessage, {
        style: { background: 'red', color: 'white', border: 'none' },
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-b from-blue-700 via-blue-600 to-blue-500 text-white p-12 flex-col justify-center items-start relative">
        <Image
          src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1727817732/reporting-tool/login-image_v9uyq0.jpg"
          alt="Air Quality"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-75"></div>
        <div className="relative max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Built for Clean Air.</h1>
          <p className="text-lg lg:text-xl mb-8">
            Access customizable, secure air quality reports for various regions in Africa.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex flex-1 bg-white items-center justify-center p-6 lg:p-12 w-full">
        <Card className=" dark:bg-[#1a202c] border-none p-6 lg:p-8 w-full max-w-lg">
          <CardContent>
            <div className="flex justify-center mb-5">
              <Image src={AirQoLogo} alt="AirQo Logo" className="w-16 lg:w-20" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white text-center mb-6 lg:mb-8">
              Sign In to Your Account
            </h2>
            <p className="text-center text-gray-600 mb-6 lg:mb-8">
              Access the AirQo Air Quality Reporting tool for different locations in Africa.
            </p>
            <FormProvider {...formMethods}>
              <form
                onSubmit={formMethods.handleSubmit(handleSubmitData)}
                className="space-y-4 lg:space-y-6"
              >
                {children}
                <Button
                  type="submit"
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex justify-center items-center space-x-2">
                      <ScaleLoader color="#fff" height={15} />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    btnText
                  )}
                </Button>
              </form>
            </FormProvider>
            <p className="text-center text-sm text-gray-600 mt-6">
              By signing in, you agree to our{' '}
              <a href="https://www.airqo.net/legal?tab=terms" className="underline text-blue-600">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="https://www.airqo.net/legal?tab=privacy" className="underline text-blue-600">
                Privacy Policy
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
