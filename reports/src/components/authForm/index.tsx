'use client';
import React, { useState, FormEvent, ReactNode } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import AirQoLogo from '@/public/images/airqo.png';
import { Card, CardContent } from '@/components/ui/card';
import { ScaleLoader } from 'react-spinners';

interface FormComponentProps {
  children: ReactNode;
  btnText: string;
}

const Index: React.FC<FormComponentProps> = ({ children, btnText }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const result = await signIn('credentials', {
        redirect: false,
        ...data,
      });

      if (result?.status === 200) {
        toast.success('User authenticated successfully', {
          style: { background: 'green', color: 'white', border: 'none' },
        });
        router.push('/home');
        return;
      } else {
        toast.error(<div className="capitalize">{result?.error}</div>, {
          style: { background: 'red', color: 'white', border: 'none' },
        });
      }
    } catch (error) {
      toast.error('Failed to log in, please try again', {
        style: { background: 'red', color: 'white', border: 'none' },
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
        <form onSubmit={handleSubmit} className="space-y-5">
          {children}
          <Button
            type="submit"
            className="w-full px-4 py-3 rounded-lg bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none"
          >
            {loading ? <ScaleLoader color="#fff" height={15} /> : btnText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Index;
