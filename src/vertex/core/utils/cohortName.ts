const normalizeSegment = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const sanitizeCohortInput = (value: string): string =>
  value.replace(/[^a-zA-Z0-9]/g, "");

export const buildCohortName = (
  city: string,
  projectName: string,
  funder?: string
): string => {
  const segments = [city, projectName, funder]
    .map((segment) => (segment ? normalizeSegment(segment) : ""))
    .filter((segment) => segment.length > 0);

  return segments.join("_");
};

export const splitCohortName = (name: string) => {
  const parts = name.split("_").filter(Boolean);
  const [city = "", projectName = "", ...rest] = parts;
  return {
    city,
    projectName,
    funder: rest.join("_"),
  };
};
