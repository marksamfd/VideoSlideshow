const {
    sentryWebpackPlugin
} = require("@sentry/webpack-plugin");

const rules = require("./webpack.rules");

rules.push({
    test: /\.scss$/,
    use: [
        {loader: "style-loader"},
        {loader: "css-loader"},
        {
            loader: "sass-loader",
            options: {
                // Force sass-loader to use the modern API instead of the legacy one
                sassOptions: {
                    api: "modern",
                    quietDeps: true, // This hides warnings inside node_modules
                    silenceDeprecations: ['legacy-js-api', 'import'],
                }
            }
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
    node: {
        __dirname: "mock",
        __filename: "mock",
    },

    mode: 'development',
    // target: 'electron-renderer', // Assures Webpack knows it is for Electron
    devtool: 'source-map',  // Best option for fast development builds
    plugins: [sentryWebpackPlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "mark-jw",
        project: "choirslides"
    })]
};