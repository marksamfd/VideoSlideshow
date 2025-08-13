import { tmpdir } from "os";
import * as path from "path";
import * as fs from "fs";
import * as archiver from "archiver";
import * as tar from "tar-stream";
import { buffer } from "stream/consumers";
import { Stream } from "stream";

enum ProjectOpenMode {
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

  #projectMode;

  /**
   * the show file path
   * @type {string}
   */
  #filePath;
  needsCreator: boolean;
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

  get projectTempFolder() {
    const projectTempPath = path.join(this.basePath, this.projectName);
    if (!fs.existsSync(projectTempPath)) {
      fs.mkdirSync(projectTempPath, { recursive: true });
    }
    return projectTempPath;
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

    this.#notInArchive[videoFileName.toLowerCase()] = videoFilePath;
    this.#notInArchive[`${imgFileName}.png`.toLowerCase()] = imgBuffer;
  }

  #extractProjectFile(
    tarFilePath: string = this.#filePath,
    outputDir: string = this.projectTempFolder
  ) {
    return new Promise((resolve, reject) => {
      const extract = tar.extract();

      extract.on("entry", (header, stream, next) => {
        const outputPath = path.join(outputDir, header.name);

        // Ensure directories exist
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        const writeStream = fs.createWriteStream(outputPath);
        stream.pipe(writeStream);

        writeStream.on("finish", next); // Wait until write completes
        writeStream.on("error", reject);
        stream.on("error", reject);
      });

      extract.on("finish", resolve);
      extract.on("error", reject);

      fs.createReadStream(tarFilePath).pipe(extract);
    });
  }

  constructor(data: any) {
    this.#filePath = data.filePath || "";
    this.#sepMode = data.mode;
    this.#delimiter = data.sepBy;

    if (data.present) {
      this.#projectMode = ProjectOpenMode.PRESENT;
    } else if (fs.existsSync(this.#filePath)) {
      this.#projectMode = ProjectOpenMode.EDIT;
    } else {
      this.#projectMode = ProjectOpenMode.NEW;
    }

    // Initialize based on mode
    this.needsCreator = this.#projectMode !== ProjectOpenMode.PRESENT;
  }

  async editProject() {
    if (this.#projectMode === ProjectOpenMode.NEW) {
      this.#lastSavedData = "[]";
    } else {
      await this.#extractProjectFile();
      this.#lastSavedData = fs.readFileSync(
        path.join(this.projectTempFolder, "slides.json"),
        "utf-8"
      );
      console.log(
        path.join(this.projectTempFolder, "slides.json"),
        this.#lastSavedData
      );
    }
    this.#isEditingOpened = true;
    this.#fileCreator = archiver("tar", {
      gzip: false, // Set to true if you want .tar.gz
    });
    this.#writeStream = fs.createWriteStream(this.#filePath);
    this.#fileCreator.pipe(this.#writeStream);

    this.#writeStream?.on("drain", () => {
      console.log("Drained adding a file to zip");
    });
    this.#writeStream?.on("warning", (e: any) => {
      console.log(`Warning while adding a file to zip: ${e.message}`);
    });
    this.#writeStream?.on("finish", () => {
      console.log("Finish adding a file to zip");
    });
    this.#writeStream?.on("close", () => {
      console.log("closing zip");
    });
    this.#writeStream?.on("data", (data: any) => {
      console.log("on data");
    });
    this.#writeStream?.on("entry", (data: any) => {
      console.log("on entry");
    });
  }

  async saveProject(content: string) {
    console.log("Saving");
    this.#addExtractedFilesToZip();
    console.log("writing");
    fs.writeFileSync(path.join(this.projectTempFolder, "slides.json"), content);
    console.log("slides");
    this.#fileCreator.append(Buffer.from(content, "utf8"), {
      name: "slides.json",
      date: new Date(2025, 7, 8, 23, 4),
    });

    console.log(this.#fileCreator);
  }

  async presentProject() {
    const slidesStream: any = await this.fileStream("slides.json");
    this.#lastSavedData = (await buffer(slidesStream)).toString("utf8");
  }

  closeProject(slidesContent: string) {
    console.log("Close Called");
    return new Promise((res, rej) => {
      console.log("Created Promise");
      if (this.#isEditingOpened) {
        console.log("Saving");
        this.#addExtractedFilesToZip();
        const slidesPath = path.join(this.projectTempFolder, "slides.json");
        fs.writeFileSync(slidesPath, slidesContent);

        this.#writeStream.on("finish", () => {
          console.log(this.#fileCreator.pointer() + " total bytes");
          console.log(
            "archiver has been finalized and the output file descriptor has closed."
          );
          res(true);
        });
        this.#writeStream.on("error", () => {
          console.error("Error writing ZIP file:");
          rej("Error in Piping");
        });
        this.#writeStream.on("end", () => {
          console.log("Data has been drained");
        });

        this.#fileCreator.pipe(this.#writeStream);
        console.log("piping");

        console.log("finalizing");
        this.#fileCreator.finalize();
      }
    });
  }
  #addExtractedFilesToZip() {
    const videosPath = path.join(this.projectTempFolder, "videos");
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
        console.log({ fp, f });
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
