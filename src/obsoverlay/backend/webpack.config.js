// apps/backend/webpack.config.js
const nodeExternals = require('webpack-node-externals');

module.exports = function (options) {
    return {
        ...options,
        externals: [
            nodeExternals({
                // Allow bundling of local workspace packages if needed,
                // but keep node_modules external
                allowlist: [],

            }),
        ],
    };
};