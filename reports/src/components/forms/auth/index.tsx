'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React, { useState, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { ScaleLoader } from 'react-spinners';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import AirQoLogo from '@/public/images/airqo.png';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(50, { message: 'Password must be at most 50 characters' }),
});

interface FormComponentProps {
  children: ReactNode;
  btnText: string;
}

const Index: React.FC<FormComponentProps> = ({ children, btnText }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmitData = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        ...data,
      });

      if (result?.status === 200) {
        toast.success('Logged in successfully, redirecting...', {
          style: { background: 'green', color: 'white', border: 'none' },
          position: 'top-center',
        });
        router.push('/home');
      } else {
        throw new Error(result?.error || 'Failed to log in, please try again');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to log in, please try again';
      toast.error(errorMessage, {
        style: { background: 'red', color: 'white', border: 'none' },
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-[#1a202c] border-none p-8 rounded-lg shadow-2xl w-full max-w-md">
      <CardContent>
        <div className="flex justify-center">
          <Image src={AirQoLogo} alt="AirQo" className="w-20 mb-5" />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitData)} className="space-y-4">
            {children}
            <Button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none"
            >
              {loading ? <ScaleLoader color="#fff" height={15} /> : btnText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Index;
