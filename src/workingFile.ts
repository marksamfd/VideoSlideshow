import { tmpdir } from "os";
import * as path from "path";
import * as fs from "fs";
import * as archiver from "archiver";
import * as tar from "tar-stream";
import * as StreamZip from "node-stream-zip";
import { buffer } from "stream/consumers";
const gunzip = require("gunzip-maybe");
import * as progress from "progress-stream";
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
class WorkingFile {
  /**
   * shows the files that are added to the archive bit not available in the stream reader
   * @type {Record<string,string | Buffer>}
   */
  #notInArchive: Record<string, string | Buffer> = {};

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
  #fileCreator: archiver.Archiver;
  #writeStream: fs.WriteStream;
  #fileExtractor: StreamZip.StreamZipAsync;

  #projectMode;
  #fileSize: number = 0;

  /**
   * the show file path
   * @type {string}
   */
  #filePath;
  get notInArchive() {
    return this.#notInArchive;
  }

  get isOpened() {
    return this.#isEditingOpened;
  }

  get projectPath() {
    return this.#filePath;
  }

  get basePath() {
    const tmpAppPath = path.join(tmpdir(), "choirSlides");
    return tmpAppPath;
  }

  /**
   * File path parsed
   * @type {ParsedPath}
   */
  get #projectFilePathParsed() {
    return path.parse(this.#filePath);
  }

  get tempProjectFolder() {
    const projectTempPath = path.join(this.basePath, this.projectName);
    if (!fs.existsSync(projectTempPath)) {
      fs.mkdirSync(projectTempPath, { recursive: true });
    }
    return projectTempPath;
  }

  get videosFolder() {
    return path.join(this.tempProjectFolder, "videos");
  }

  get projectMode() {
    return this.#projectMode;
  }
  /**
   * Opened file name
   * @type {string}
   */
  get projectName() {
    return this.#projectFilePathParsed.name;
  }

  /**
   * Adds image and video files to the archive and tracks the video file path.
   *
   */

  addVideoSlideFiles(props: addVideoSlideFileInterface) {
    const { imgBuffer, imgFileName, videoFilePath, videoFileName } = props;
    this.#fileCreator.append(imgBuffer, { name: `videos/${imgFileName}.png` });
    this.#fileCreator.file(videoFilePath, { name: `videos/${videoFileName}` });
    console.log("added Video Files");

    console.log(
      imgBuffer.length,
      fs.statSync(videoFilePath).size,
      this.#fileSize
    );
    this.#fileSize += imgBuffer.length + fs.statSync(videoFilePath).size;
    this.#notInArchive[videoFileName.toLowerCase()] = videoFilePath;
    this.#notInArchive[`${imgFileName}.png`.toLowerCase()] = imgBuffer;
  }

  #extractProjectFile() {
    return this.#fileExtractor.extract(null, this.tempProjectFolder);
  }

  constructor(data: any) {
    this.#filePath = data.filePath || "";
    this.#sepMode = data.mode;
    this.#delimiter = data.sepBy;

    if (data.present) {
      this.#projectMode = ProjectOpenMode.PRESENT;
    } else if (fs.existsSync(this.#filePath)) {
      this.#projectMode = ProjectOpenMode.EDIT;
      this.#fileExtractor = new StreamZip.async({ file: this.#filePath });
    } else {
      this.#projectMode = ProjectOpenMode.NEW;
    }
  }

  async editProject() {
    if (this.#projectMode === ProjectOpenMode.NEW) {
      this.#lastSavedData = "[]";
    } else {
      await this.#extractProjectFile();
      this.#lastSavedData = fs.readFileSync(
        path.join(this.tempProjectFolder, "slides.json"),
        "utf-8"
      );
    }
    this.#isEditingOpened = true;
    this.#fileCreator = archiver("zip", {
      zlib: {
        level: 9,
      },
    });
    this.#writeStream = fs.createWriteStream(this.#filePath);
  }

  async saveProject(content: string) {
    console.log("Saving");
    this.#addExtractedFilesToZip();
    console.log("writing");
    fs.writeFileSync(path.join(this.tempProjectFolder, "slides.json"), content);
  }

  async presentProject() {
    const slidesStream: any = await this.fileStream("slides.json");
    this.#lastSavedData = (await buffer(slidesStream)).toString("utf8");
  }

  closeProject(slidesContent: string, saveProgress: progress.ProgressStream) {
    console.log("Close Called");
    return new Promise((res, rej) => {
      console.log("Created Promise");
      if (this.#isEditingOpened) {
        const slidesPath = path.join(this.tempProjectFolder, "slides.json");
        this.#fileCreator.append(fs.readFileSync(slidesPath), {
          name: "slides.json",
        });

        saveProgress.setLength(
          this.#fileSize + Buffer.byteLength(slidesContent) * 1
        );

        this.#writeStream.on("close", () => {
          console.log(this.#fileCreator.pointer() + " total bytes");
          console.log(
            "archiver has been finalized and the output file descriptor has closed."
          );
          res(true);
        });
        this.#writeStream.on("error", (err) => {
          console.error("Error writing ZIP file:");
          rej(`Error in Piping ${err}`);
        });
        this.#writeStream.on("end", () => {
          console.log("Data has been drained");
        });

        console.log("Finalizing ZIP");
        this.#fileCreator.finalize();

        console.log("Piping stream to zip");
        this.#fileCreator.pipe(saveProgress).pipe(this.#writeStream);
      }
    });
  }

  #addExtractedFilesToZip() {
    const videosPath = path.join(this.tempProjectFolder, "videos");
    const filesInPath = new Set(
      fs.existsSync(videosPath) ? fs.readdirSync(videosPath) : []
    );
    const filesInArray = new Set(this.#addedToArchive);
    const filesToBeAdded = [...filesInPath].filter(
      (element: string) => !filesInArray.has(element)
    );
    if (filesToBeAdded.length > 0) {
      for (const f of filesToBeAdded) {
        const fp = path.join(videosPath, f);
        this.#fileCreator.append(fs.createReadStream(fp), {
          name: `videos/${f}`,
        });
        this.#addedToArchive.push(`${f}`);
      }
    }
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
    return this.#fileExtractor.entryData(zipfilePath);
    return new Promise((resolve, reject) => {
      const extract = tar.extract();
      const tarStream = fs.createReadStream(this.#filePath);

      let found = false;

      extract.on("entry", (header, stream, next) => {
        if (header.name === zipfilePath) {
          found = true;
          resolve(stream); // Pass the file stream out
          // Don't call `next()` here — let consumer drain the stream
        } else {
          stream.resume(); // Skip this entry
          next();
        }
      });

      extract.on("finish", () => {
        if (!found) reject(new Error(`File not found: ${zipfilePath}`));
      });

      tarStream.pipe(extract);
    });
  }
}

export default WorkingFile;
