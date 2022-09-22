function HomePage() {
  return (
    <>
      <h1>Airqo platform (beta)</h1>
      <div>
        Find the original airqo platform
        <a href={process.env.NEXT_PUBLIC_ORIGINAL_PLATFORM}>here</a>
      </div>
      <h1 className='text-3xl font-bold underline'>Hello world!</h1>
    </>
  );
}

export default HomePage;
