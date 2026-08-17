interface PageProps {
  params: {
    org_slug: string;
  };
}

const Page = ({ params }: PageProps) => {
  // Keep the route stable while the underlying module remains available for
  // a future re-enable.
  void params;
  return <div />;
};

export default Page;
