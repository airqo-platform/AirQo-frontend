const { merge } = require("webpack-merge");
const webpack = require("webpack");

const dotenv = require("dotenv");
dotenv.config({ path: `.env` });
dotenv.config({ path: `.env.production`, override: true });

const common = require("./webpack.common.js");


module.exports = merge(common, {
    mode: "production",
    plugins: [
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env),
        }),
    ],
    
});