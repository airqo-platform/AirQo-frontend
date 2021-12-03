import { isEmpty } from "underscore";

const siteLabel = (name, description) => {
  return `${name || description}`;
};

export const createSiteOptions = (sites) => {
  const siteOptions = [];
  sites.map(({ name, description, ...rest }) => {
    siteOptions.push({
      label: siteLabel(name, description),
      value: rest._id,
    });
  });
  return siteOptions;
};

export const filterSite = (sites, site_id) => {
  const currentSite = sites.filter((site) => site.value === site_id);
  if (isEmpty(currentSite)) {
    return { label: "", value: null };
  }
  return currentSite[0];
};

export const flattenSiteOptions = (options) => {
  const arr = [];
  options.map((opt) => arr.push(opt.value));
  return arr;
};

export const siteOptionsToObject = (options) => {
  const obj = {};
  options.map((opt) => (obj[opt.value] = opt));
  return obj;
};
