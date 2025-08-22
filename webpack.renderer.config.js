const {
  sentryWebpackPlugin
} = require("@sentry/webpack-plugin");

const rules = require("./webpack.rules");

rules.push({
  test: /\.scss$/,
  use: [
    { loader: "style-loader" },
    { loader: "css-loader" },
    {
      loader: "sass-loader",
    },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: function () {
            return [require("autoprefixer")];
          },
        },
      },
    },
  ],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },

  output: {
    publicPath: "./../",
    assetModuleFilename: "[name][ext]",
  },

  resolve: {
    extensions: [".ts", ".js"],
  },

  devtool: "source-map",

  plugins: [sentryWebpackPlugin({
    authToken: process.env.SENTRY_AUTH_TOKEN,
    org: "mark-jw",
    project: "choirslides"
  })]
};