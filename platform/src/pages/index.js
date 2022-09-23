function HomePage() {
  return (
    <>
      <h1>Airqo platform (beta)</h1>
      <div>
        Find the original airqo platform
        <a
          className='text-3xl p-2 underline font-bold'
          href={process.env.NEXT_PUBLIC_ORIGINAL_PLATFORM}
        >
          here
        </a>
      </div>
    </>
  );
}

export default HomePage;
