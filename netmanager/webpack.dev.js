const { merge } = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");

const dotenv = require("dotenv");
dotenv.config({ path: `.env.development` });
dotenv.config({ path: `.env.development.local`, override: true });

const common = require("./webpack.common.js");

const port = process.env.PORT || 5000;

module.exports = merge(common, {
    mode: "development",
    devServer: {
        static: {
            directory: path.join(__dirname, "build"),
        },
        client: {
            logging: "info",
            overlay: true,
            reconnect: 2,
        },

        historyApiFallback: true,

        compress: true,
        port: port,
        hot: true,
    },
    plugins: [
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env),
        }),
    ],
});