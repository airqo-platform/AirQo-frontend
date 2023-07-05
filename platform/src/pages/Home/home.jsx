import Layout from '@/components/Layout';
import HeaderNav from '@/components/Layout/header';
import illustration from '@/icons/Home/illustration.jpg';
import Image from 'next/image'
const Home = () => (
  <Layout>
    <section
      
    >
      <div className="flex p-4 flex-row gap-4 self-stretch rounded-lg border border-gray-100 bg-white mt-6 mx-12 ">
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center pt-12 w-303 h-92 ">
            <div
              className=" flex items-center justify-center border border-gray-100 "
              style={{ width: '303px', height: '92px' }}
            >
              Home
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-start justify-end">
          <div className="flex items-start ml-auto ">
            <Image 
              src={illustration} 
              alt="Home"
              width="450px"
              height="216px"
            />
          </div>
        </div>
      </div>
      <div className="flex-row justify-between">
        <div className="flex">
          <div
            className="flex-col flex flex-1 items-start p-24 self-stretch rounded-lg border border-gray-100 bg-white mt-6 mx-12 "
          >
            <div className=" flex justify-center items-start">
              Home1
            </div>
          </div>
          <div
            className="flex-col flex flex-1 items-start  p-24 self-stretch rounded-lg border border-gray-100 bg-white mt-6 mx-12 "
          >
            <div className=" flex justify-center items-start">
              Home2
            </div>
          </div>
          <div
            className="flex-col flex flex-1 items-start p-24 self-stretch rounded-lg border border-gray-100 bg-white mt-6 mx-12 "
          >
            <div className=" flex justify-start items-start">
              Home3
            </div>
          </div>
        </div>
      </div>

    </section>
  </Layout>
);

export default Home;
