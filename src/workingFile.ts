import * as path from "path";
import {join} from "path";
import * as fs from "fs";
import * as archiver from "archiver";
import * as StreamZip from "node-stream-zip";
import * as progress from "progress-stream";
import Slide from "./renderer/js/Classes/Slide";
import {copyFile, readFile, writeFile} from "node:fs/promises"
import {ensureDir, ensureDirSync} from "fs-extra";

export enum ProjectOpenMode {
    NEW,
    EDIT,
    PRESENT,
}

interface addVideoSlideFileInterface {
    imgBuffer: Buffer;
    imgFileName: string;
    videoFilePath: string;
    videoFileName: string;
}

interface NotInArchiveFile {
    file: string | Buffer;
    size: number;
}

export type WorkingFileType = {

    filePath: string;
    mode: "word" | "delim";
    sepBy: string | number;
    content: string;
    present?: boolean;
}

class WorkingFile {
    /**
     * shows the files that are added to the archive bit not available in the stream reader
     * @type {Record<string,string | Buffer>}
     */
    private _notInArchive: Record<string, NotInArchiveFile> = {};

    #addedToArchive: string[] = [];

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
     * Saved data content of the file JSON slideshow
     */
    #lastSavedData: string;

    /**
     * shows weather the file is opened or not
     * @type{boolean}
     */
    #isEditingOpened = false;

    /**
     * Zip Object file
     *
     */
    #fileCreator!: archiver.Archiver;
    #writeStream: fs.WriteStream;
    #fileExtractor!: StreamZip.StreamZipAsync;
    private needsRepacking = false;

    #projectMode;
    #fileSize: number = 0;

    public isNeedRepacking() {
        return this.needsRepacking;
    }

    /**
     * the show file path
     * @type {string}
     */
    #filePath;

    get notInArchive() {
        return this._notInArchive;
    }

    get isOpened() {
        return this.#isEditingOpened;
    }

    get projectPath() {
        return this.#filePath;
    }


    private get projectFilePathParsed() {
        return path.parse(this.#filePath);
    }


    get videosFolder() {
        return path.join(this.projectFilePathParsed.dir, "videos");
    }

    get projectMode() {
        return this.#projectMode;
    }

    /**
     * Opened file name
     * @type {string}
     */
    get projectName() {
        return this.projectFilePathParsed.name;
    }

    /**
     * Adds image and video files to the archive and tracks the video file path.
     *
     */

    addSlideFiles(props: addVideoSlideFileInterface) {
        const {imgBuffer, imgFileName, videoFilePath, videoFileName} = props;
        this._notInArchive[videoFileName] = {
            file: videoFilePath,
            size: fs.statSync(videoFilePath).size,
        };
        this._notInArchive[`${imgFileName}.png`] = {
            file: imgBuffer,
            size: imgBuffer.length,
        };
    }

    removeSlideFiles(videoFileName: string, imgFileName: string) {
        delete this._notInArchive[videoFileName];
        delete this._notInArchive[`${imgFileName}.png`];
        this.needsRepacking = true;
    }

    constructor(data: WorkingFileType) {
        this.#filePath = data.filePath || "";
        this.#sepMode = data.mode;
        this.#delimiter = data.sepBy;
        //TODO: File extenstion association
        //TODO: handle not saved, execute closeProject on opening another file using needsRepacking tag. Handle not saved in file

        if (data.present) {
            this.#projectMode = ProjectOpenMode.PRESENT;
            // this.#fileExtractor = new StreamZip.async({file: this.#filePath});
        } else if (fs.existsSync(this.#filePath)) {
            this.#projectMode = ProjectOpenMode.EDIT;
            // this.#fileExtractor = new StreamZip.async({file: this.#filePath});
        } else {
            this.#projectMode = ProjectOpenMode.NEW;
        }
    }

    newProject(projectName: string) {

        ensureDirSync(join(this.#filePath, projectName))
        ensureDirSync(join(this.#filePath, projectName, "videos"))
        this.#filePath = path.join(this.#filePath, projectName, `${projectName}.chs`)
        this.#lastSavedData = "[]";
        this.#isEditingOpened = true;
    }

    editProject() {
        this.#lastSavedData = fs.readFileSync(
            this.#filePath,
            "utf-8"
        );
        this.#isEditingOpened = true;
    }

    saveProject(content: string) {
        console.log("Saving");
        this.needsRepacking = true;
        fs.writeFileSync(path.join(this.projectPath), content);
    }


    closeProject(slidesContent: string = "") {

        let copyPromises = Object.keys(this._notInArchive).filter(file => typeof this._notInArchive[file].file === "string").map(file =>
            copyFile(this._notInArchive[file].file, `${this.videosFolder}/${file}`)
        )
        let writePromises = Object.keys(this._notInArchive).filter(file => typeof this._notInArchive[file].file !== "string").map(file =>
            writeFile(`${this.videosFolder}/${file}`, this._notInArchive[file].file)
        )
        if (slidesContent !== "") {
            writePromises.push(writeFile(this.#filePath, slidesContent, {encoding: "utf8"}));
        }
        return Promise.all([...copyPromises, ...writePromises]);
    }

    async presentProject() {
        this.#lastSavedData = await readFile(this.#filePath, {encoding: "utf8"});
    }

    toObject() {
        return {
            filePath: this.#filePath,
            sepBy: this.#delimiter,
            mode: this.#sepMode,
            content: this.#lastSavedData,
        };
    }

    async fileStream(zipfilePath: string) {
        return readFile(path.join(this.projectFilePathParsed.dir, zipfilePath));
    }
}

export default WorkingFile;
