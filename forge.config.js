const {join} = require("path");
const {OverlayBuildPlugin} = require("./overlayBuildPlugin");

const {execSync, spawn, fork} = require("child_process");
const forgeConf = {
    packagerConfig: {
        asar: {
            unpackDir: "files",
        },
        // ignore: [
        //     /^\/src\/obsoverlay\/frontend\/src/,
        //     /^\/src\/obsoverlay\/backend\/src/,
        // ],
        // Explicitly bundle the production distributions as external extra resources
        extraResource: [
            join(__dirname, 'build-assets/backend-server')
        ],
        icon: "./src/icons/icon.ico",
    },
    rebuildConfig: {},
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {},
        },
        {
            name: "@electron-forge/maker-zip",
            config: {},
            platforms: ["darwin"],
        },
        {
            name: "@electron-forge/maker-deb",
            config: {},
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {},
        },
    ],
    plugins: [
        // {
        //     name: '@electron-forge/plugin-auto-unpack-natives',
        //     config: {},
        // },
        {
            name: "@electron-forge/plugin-webpack",
            config: {

                mainConfig: "./webpack.main.config.js",
                devContentSecurityPolicy: "media-src file:",
                renderer: {
                    config: "./webpack.renderer.config.js",
                    entryPoints: [
                        {
                            html: "./src/renderer/presenterView/index.html",
                            css: "./src/renderer/presenterView/index.scss",
                            js: "./src/renderer/presenterView/renderer.js",
                            name: "main_window",
                            preload: {
                                js: "./src/renderer/preload.js",


                            },
                        },
                        {
                            html: "./src/renderer/openFileDialog/index.html",
                            js: "./src/renderer/openFileDialog/index.js",
                            name: "open_file_dialog",
                            preload: {
                                js: "./src/renderer/preload.js",

                            },
                        },
                        {
                            html: "./src/renderer/saveFileDialog/index.html",
                            js: "./src/renderer/saveFileDialog/index.js",
                            name: "save_file_dialog",
                            preload: {
                                js: "./src/renderer/preload.js",

                            },
                        },
                        {
                            html: "./src/renderer/presentationView/index.html",
                            js: "./src/renderer/presentationView/renderer.ts",
                            name: "presentation_view",
                            preload: {
                                js: "./src/renderer/preloadPresentationView.js",

                            },
                        },
                        {
                            html: "./src/renderer/ShowCreateView/index.html",
                            js: "./src/renderer/ShowCreateView/renderer.js",
                            name: "show_creator_view",
                            preload: {
                                js: "./src/renderer/preload.js",
                            },
                        },
                    ],
                },

                devServer: {
                    hot: true,
                    liveReload: true,

                },
            },
        },
        new OverlayBuildPlugin()
    ],
    publishers: [
        {
            name: "@electron-forge/publisher-github",
            config: {
                repository: {
                    owner: "marksamfd",
                    name: "VideoSlideshow",
                },
                prerelease: false,
            },
        },
    ],
};

module.exports = forgeConf;
