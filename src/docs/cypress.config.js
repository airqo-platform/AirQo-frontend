const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "v2fvjt",
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    chromeWebSecurity: false, //Skip Same Origin Policy to support tests that span multiple domains
  },
});
