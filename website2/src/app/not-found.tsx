// not-found.tsx
'use client';

import Image_404 from '@public/assets/svgs/402.svg';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { CustomButton } from '@/components/ui';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
      {/* Sad cloud image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <Image src={Image_404} alt="Sad Cloud" width={300} height={300} />
      </motion.div>

      {/* Error message */}
      <motion.h1
        className="text-3xl font-bold mt-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeInOut' }}
      >
        <span className="text-blue-500">Oops!</span> We can&apos;t seem to find
        the page <br /> you&apos;re looking for.
      </motion.h1>

      {/* Return home button */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: 'easeInOut' }}
      >
        <Link href="/" passHref>
          <CustomButton className=" text-white ">Return back home</CustomButton>
        </Link>
      </motion.div>

      {/* Error code */}
      <motion.p
        className="mt-4 text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5, ease: 'easeInOut' }}
      >
        Error code: 404 Page not found
      </motion.p>
    </div>
  );
};

export default NotFoundPage;
