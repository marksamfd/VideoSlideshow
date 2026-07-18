const {PluginBase} = require("@electron-forge/plugin-base");
const path = require("path");
const fs = require("fs");
const {execSync} = require("child_process");

class OverlayBuildPlugin extends PluginBase {
    name = "OverlayBuildPlugin";

    rootDir = __dirname;
    backendDir = path.join(this.rootDir, 'src', 'obsoverlay', 'backend');
    buildStageDir = path.join(this.rootDir, 'build-assets', 'backend-server');

    startLogic(_startOpts) {
        return false
    }

    getHooks() {
        return {
            preStart: [this.preStart.bind(this)],
            prePackage: [this.prePackage.bind(this)],
            postPackage: [this.postPackage.bind(this)]
        };
    }


    buildOverlay() {
        console.log('🚀 Building Frontend application...');
        execSync('npm run build:overlay/frontend', {cwd: this.rootDir, stdio: 'inherit'});
        console.log('🚀 Building NestJS application...');
        execSync('npm run build:overlay/backend', {cwd: this.rootDir, stdio: 'inherit'});
    }

    preStart(e) {
        this.buildOverlay()

    }

    prePackage() {
        console.log('running prePackage hook');

        console.log('🧹 Cleaning old build staging assets...');
        if (fs.existsSync(this.buildStageDir)) {
            fs.rmSync(this.buildStageDir, {
                recursive: true, force: true
            });
        }
        fs.mkdirSync(path.join(this.buildStageDir, 'dist'), {recursive: true});

        this.buildOverlay()
        if (process.env.NODE_ENV !== 'dev') {
            console.log('📂 Copying compiled production files to stage...');
            fs.cpSync(path.join(this.backendDir, 'dist'), path.join(this.buildStageDir, 'dist'), {recursive: true});
            fs.copyFileSync(path.join(this.backendDir, 'package.json'), path.join(this.buildStageDir, 'package.json'));

            console.log('📦 Installing production dependencies inside staging asset...');
            // This runs in your current terminal context where npm is fully accessible
            execSync('npm install --omit=dev', {
                cwd: this.buildStageDir, stdio: 'inherit'
            });
        }
        console.log('✅ Backend pre-packaging pipeline complete!');
    }

    postPackage() {
        fs.rmSync(this.buildStageDir, {recursive: true, force: true});
    }
}

module.exports = {OverlayBuildPlugin};