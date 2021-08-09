export const createSiteOptions = (sites) => {
  const siteOptions = [];
  sites.map(({ name, description, generated_name, ...rest }) => {
    siteOptions.push({
      label: `${name || description || generated_name} (${generated_name})`,
      value: rest._id,
    });
  });
  return siteOptions;
};
