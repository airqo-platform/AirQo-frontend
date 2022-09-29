import { LEGACY_PLATFORM_ENV } from 'lib/envConstants';

function HomePage() {
  return (
    <>
      <h1>Airqo platform (beta)</h1>
      <div>
        Find the original airqo platform
        <a
          className='text-3xl p-2 underline font-bold'
          href={LEGACY_PLATFORM_ENV}
        >
          here
        </a>
      </div>
    </>
  );
}

export default HomePage;
