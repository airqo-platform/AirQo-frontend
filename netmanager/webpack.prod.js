const { merge } = require("webpack-merge");

const dotenv = require("dotenv");
dotenv.config({ path: `.env.production` });
dotenv.config({ path: `.env.production.local`, override: true });

const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "production"
});