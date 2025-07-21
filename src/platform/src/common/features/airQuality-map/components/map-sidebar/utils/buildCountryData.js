import allCountries from '../constants/countries.json';

export default function buildCountryData(siteDetails = []) {
  const seen = new Set();
  return siteDetails.reduce((acc, site) => {
    if (seen.has(site.country)) return acc;
    const country = allCountries.find((c) => c.country === site.country);
    if (country) {
      seen.add(site.country);
      acc.push({ ...site, ...country });
    }
    return acc;
  }, []);
}
