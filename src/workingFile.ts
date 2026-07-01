import { tmpdir } from "os";
import * as path from "path";
import * as fs from "fs";
import * as archiver from "archiver";
import * as tar from "tar-stream";
import * as StreamZip from "node-stream-zip";
import { buffer } from "stream/consumers";
const gunzip = require("gunzip-maybe");
import * as progress from "progress-stream";
import Slide from "./renderer/js/Classes/Slide";
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

class WorkingFile {
  /**
   * shows the files that are added to the archive bit not available in the stream reader
   * @type {Record<string,string | Buffer>}
   */
  #notInArchive: Record<string, NotInArchiveFile> = {};

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

  addSlideFiles(props: addVideoSlideFileInterface) {
    const { imgBuffer, imgFileName, videoFilePath, videoFileName } = props;
    this.needsRepacking = true;
    this.#notInArchive[videoFileName.toLowerCase()] = {
      file: videoFilePath,
      size: fs.statSync(videoFilePath).size,
    };
    this.#notInArchive[`${imgFileName}.png`.toLowerCase()] = {
      file: imgBuffer,
      size: imgBuffer.length,
    };
  }

  removeSlideFiles(videoFileName: string, imgFileName: string) {
    delete this.#notInArchive[videoFileName.toLowerCase()];
    delete this.#notInArchive[`${imgFileName}.png`.toLowerCase()];
    this.needsRepacking = true;
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
      this.#fileExtractor = new StreamZip.async({ file: this.#filePath });
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
  }

  async saveProject(content: string) {
    console.log("Saving");
    this.needsRepacking = true;
    fs.writeFileSync(path.join(this.tempProjectFolder, "slides.json"), content);
  }

  async presentProject() {
    const slidesStream = await this.fileStream("slides.json");
    this.#lastSavedData = slidesStream.toString("utf8");
  }

  closeProject(slidesContent: string, saveProgress: progress.ProgressStream) {
    console.log("Close Called");
    return new Promise((res, rej) => {
      console.log("Created Promise");
      if (this.#isEditingOpened && this.needsRepacking) {
        this.#writeStream = fs.createWriteStream(this.#filePath);

        const slidesPath = path.join(this.tempProjectFolder, "slides.json");

        this.#fileCreator.append(fs.readFileSync(slidesPath), {
          name: "slides.json",
        });
        this.#addFilesToZip(JSON.parse(slidesContent));
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
      } else {
        res(true);
      }
    });
  }

  #addFilesToZip(slides: Slide[]) {
    Object.entries(this.#notInArchive).forEach(([key, element]) => {
      let fileSrc =
        element.file instanceof String
          ? fs.createReadStream(element.file)
          : element.file;
      this.#fileCreator.append(fileSrc, { name: `videos/${key}` });
      this.#fileSize += element.size;
    });

    const videosPath = this.videosFolder;
    const filesInPath = new Set(
      fs.existsSync(videosPath) ? fs.readdirSync(videosPath) : []
    );
    const videosInSlides = new Set(
      slides.flatMap((slide) => slide.videoFileName + slide.videoFileFormat)
    );
    const thumbnailInSlides = new Set(
      slides.flatMap(
        (slide) => slide.videoFileName + slide.videoThumbnailFormat
      )
    );

    const allFilesinSlides = new Set([...videosInSlides, ...thumbnailInSlides]);

    // Intersection of allFilesinSlides and filesInPath
    const intersection = [...allFilesinSlides].filter((x) =>
      filesInPath.has(x)
    );
    // Use 'intersection' as needed
    intersection.forEach((file) => {
      const filePath = path.join(videosPath, file);
      this.#fileCreator.append(fs.createReadStream(filePath), {
        name: `videos/${file}`,
      });
      this.#fileSize += fs.statSync(filePath).size;
    });
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
  }
}

export default WorkingFile;
