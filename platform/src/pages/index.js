function HomePage() {
  return (
    <>
      <h1>Airqo platform (beta)</h1>
      <div>
        Find the original airqo platform
        <a href={process.env.NEXT_PUBLIC_ORIGINAL_PLATFORM}>here</a>
      </div>
    </>
  );
}

export default HomePage;
