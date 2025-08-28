import registerCodeCoverageTask from '@cypress/code-coverage/task';

const plugin = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  registerCodeCoverageTask(on, config);

  return config;
};

export default plugin;
