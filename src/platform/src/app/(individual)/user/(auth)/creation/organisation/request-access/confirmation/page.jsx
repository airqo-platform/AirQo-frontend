import Link from 'next/link';
import CongratsImage from '@/images/EventHandling/congratulations.svg';

const OrgRequestSubmissionConfirmationPage = () => {
  return (
    <div className="relative w-screen h-screen bg-white overflow-x-hidden">
      <div className="">
        <CongratsImage className="absolute left-0 right-0 top-0 bottom-0 mb-0 mt-36 mx-auto w-auto h-auto" />
      </div>

      <div className="flex flex-col justify-center items-center mt-96 w-full md:px-48 px-6 pb-4">
        <div className="mt-2 w-full flex items-center justify-center">
          <h3 className="text-3xl text-black-700 font-semibold">
            Request Submitted
          </h3>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <h6 className="text-xl font-normal lg:w-11/12 text-center">
            Our team will review your request and get back to you within 2-3
            business days. You will receive an email notification once your
            request has been processed
          </h6>
        </div>
        <div className="mt-12">
          <Link href="/">
            <button className="w-full btn bg-blue-600 rounded-none text-sm outline-none border-none hover:bg-blue-700 px-12">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrgRequestSubmissionConfirmationPage;
