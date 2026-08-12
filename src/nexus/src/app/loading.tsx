export default function AppLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="SecondaryMainloader"
        style={{
          opacity: 0,
          animation:
            'nexus-route-fade-in 0.25s ease 0.15s both, l13 1s infinite linear',
        }}
        aria-label="Loading"
      />
    </div>
  );
}
