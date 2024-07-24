import path from "path";
import AdmZip from "adm-zip";
import fs from "fs";
import fsp from "fs/promises";
import fswin from "fswin";

class WorkingFile {
    /**
     * shows weather the file is opened or not
     * @type{boolean}
     */
    #isOpened = false

    get isOpened() {
        return this.#isOpened
    }

    /**
     * the show file path
     * @type {string}
     */
    #filePath;

    /**
     * @type {string}
     */
    #sepMode;

    /**
     * separation delimiter
     * @type{number || string}
     */
    #delimiter;

    /**
     * Random number for files opening
     * @type{number}
     */
    #projectRandom

    /**
     * Saved data content of the file
     * @type {string}
     */
    #lastSavedData;


    constructor(data) {
        this.#filePath = data.filePath || "";
        this.#sepMode = data.mode;
        this.#delimiter = data.sepBy;
        this.#projectRandom = this.#getRandomInt(1000, 9999)
    }

    /**
     * File path parsed
     * @type {ParsedPath}
     */
    get #filePathParsed() {
        return path.parse(this.#filePath);
    }

    /**
     * Opened file directory
     * @type {string}
     */
    get #openedFileDirectory() {
        return this.#filePathParsed.dir
    }

    get #workingTempDir() {
        return "temp-" + this.#projectRandom
    }

    /**
     * the path of video file directory
     * @type {string}
     */
    get basePath() {
        return path.join(this.#openedFileDirectory, this.#workingTempDir)
    }

    /**
     * the path of json file of project
     * @type {string}
     */
    get #baseFilePath() {
        return path.join(this.#openedFileDirectory, this.#projectRandom + ".json")
    }

    /**
     * Opened file name
     * @type {string}
     */
    get projectName() {
        return this.#filePathParsed.name;
    }

    /**
     * generate random int for file open
     * @param min
     * @param max
     * @return {number}
     */

    #getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    createProject() {
        if (!fs.existsSync(this.#filePath)) {
            fs.writeFile(this.#baseFilePath, JSON.stringify([], null, 2), (err) => {

            })
            if (!fs.existsSync(this.basePath)) {
                fs.mkdirSync(this.basePath);
                fswin.setAttributesSync(this.basePath, {IS_HIDDEN: true});
            }
            this.#lastSavedData = "[]"
            this.#isOpened = true
        }
    }

    openProject() {
        let zip = new AdmZip(this.#filePath)
        zip.extractAllTo(this.#openedFileDirectory)
        fs.renameSync(path.join(this.#openedFileDirectory, "videos"), this.basePath)
        fs.renameSync(path.join(this.#openedFileDirectory, "slides.json"), this.#baseFilePath)
        fswin.setAttributesSync(this.basePath, {IS_HIDDEN: true});
        fswin.setAttributesSync(this.#baseFilePath, {IS_HIDDEN: true});
        this.#lastSavedData = fs.readFileSync(path.join(this.#openedFileDirectory, this.#projectRandom + ".json"), {encoding: "utf8"})
        this.#isOpened = true
        console.log(`Opening ${this.#projectRandom}`)
    }

    saveProject(content) {
        const zip = new AdmZip();
        console.log("saving project")
        zip.addFile('slides.json', content)
        let files = fs.readdirSync(this.basePath)
        if (files.length > 0) {
            zip.addLocalFolder(this.basePath, "videos");
        } else {
            zip.addFile("videos/", null)
        }

        return zip.writeZipPromise(this.#filePath).then(() => {
            this.#lastSavedData = content
        })
    }

    async removeAllFilesAsync(directory) {
        const files = await fsp.readdir(directory);

        for (const file of files) {
            const filePath = path.join(directory, file);
            await fs.unlinkSync(filePath);
        }
    }

    closeProject() {
        if (this.#isOpened) {
            console.log(`Closing ${this.#projectRandom}`)
            fsp.rm(this.#baseFilePath).then(() => {
                return this.removeAllFilesAsync(this.basePath)
            }).then(() => {
                return fsp.rm(this.basePath, {recursive: true, force: true})
            }).then(() => {
                this.#isOpened = false
                console.log(`${this.#projectRandom} is ${this.isOpened}`)
            }).catch(e => {
                console.log(e)
            });
        }
    }

    toObject() {
        return {
            basePath: this.basePath,
            filePath: this.#filePath,
            sepBy: this.#delimiter,
            mode: this.#sepMode,
            content: this.#lastSavedData
        }
    }

}

export default WorkingFile;