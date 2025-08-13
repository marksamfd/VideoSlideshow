module.exports = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: "node-loader",
  },
  {
    // Note: I dont have `svg` here because I run my .svg through the `@svgr/webpack` loader,
    // but you can add it if you have no special requirements
    test: /\.(gif|icns|ico|jpg|png|otf|eot|woff|woff2|ttf|svg)$/,
    type: "asset/resource",
    generator: {
      outputPath: "./",
    },
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: "@vercel/webpack-asset-relocator-loader",
      options: {
        outputAssetBase: "native_modules",
      },
    },
  },
  // Put your webpack loader rules in this array.  This is where you would put
  // your ts-loader configuration for instance:
  /*   *
   * Typescript Example:
   * */
  {
    test: /\.ts$/,
    include: /src/,
    use: "ts-loader",
  },
];
