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
