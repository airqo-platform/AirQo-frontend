// eslint-disable-next-line @typescript-eslint/no-require-imports
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
  projectId: 'ap5jjk',
  env: {
    url_token: process.env.NEXT_PUBLIC_API_TOKEN,
  },
});
