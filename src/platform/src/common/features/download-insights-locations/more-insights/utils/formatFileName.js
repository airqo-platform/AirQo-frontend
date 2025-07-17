import { format } from 'date-fns';

export default function formatFileName({
  visibleSites,
  allSites,
  pollutant,
  startDate,
  endDate,
}) {
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');

  if (visibleSites.length === 1) {
    const siteName =
      allSites.find((s) => s._id === visibleSites[0])?.name || 'site';
    return `${siteName}_${pollutant}_${startStr}_to_${endStr}.csv`;
  }
  return `${visibleSites.length}_sites_${pollutant}_${startStr}_to_${endStr}.csv`;
}
