const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:4040',
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
  projectId: 'ap5jjk',
});
