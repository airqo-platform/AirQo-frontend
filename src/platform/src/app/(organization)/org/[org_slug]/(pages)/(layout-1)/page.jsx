import { redirect } from 'next/navigation';

const page = ({ params }) => {
  // Extract the org_slug from the URL parameters
  const { org_slug } = params;

  // Redirect to the organization's dashboard page
  redirect(`/org/${org_slug}/dashboard`);

  // This return is just to satisfy the function signature, it won't be reached
  return null;
};

export default page;
