import { redirect } from 'next/navigation';

export default function ForumEventPage({
  params,
}: {
  params: { uniqueTitle: string };
}) {
  redirect(
    `/africa-clean-air-forum/${encodeURIComponent(params.uniqueTitle)}/about`,
  );
}
