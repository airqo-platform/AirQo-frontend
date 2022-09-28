import {LEGACY_PLATFORM_ENV} from 'lib/envConstants';
function HomePage() {
  return (
    <>
      <h1>Airqo platform (beta)</h1>
      <div>
        Find the original airqo platform
        <a href={LEGACY_PLATFORM_ENV}>here</a>
      </div>
    </>
  );
}

export default HomePage;
