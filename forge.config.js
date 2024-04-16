module.exports = {
    packagerConfig: {
        asar:{
            unpackDir :"files"
        }
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {},
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
    plugins: [
        // {
        //     name: '@electron-forge/plugin-auto-unpack-natives',
        //     config: {},
        // },
        {
            name: '@electron-forge/plugin-webpack',
            config: {
                mainConfig: './webpack.main.config.js',
                renderer: {
                    config: './webpack.renderer.config.js',
                    entryPoints: [
                        {
                            html: './src/renderer/presenterView/index.html',
                            css: './src/renderer/presenterView/index.scss',
                            js: './src/renderer/presenterView/sideBarResize.js',
                            name: 'main_window',
                            preload: {
                                js: './src/renderer/preload.js'
                            }
                        },
                        {
                            html: './src/renderer/openFileDialog/index.html',
                            js: './src/renderer/openFileDialog/index.js',
                            name: 'open_file_dialog',
                            preload: {
                                js: './src/renderer/preload.js'
                            }
                        },
                        {
                            html: './src/renderer/presentationView/index.html',
                            js: './src/renderer/presentationView/renderer.js',
                            name: 'presentation_view',
                            preload: {
                                js: './src/renderer/preload.js'
                            }
                        }
                    ]

                },

            }
        }
    ],
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: 'marksamfd',
                    name: 'VideoSlideshow'
                },
                prerelease: false
            }
        }
    ]
};
