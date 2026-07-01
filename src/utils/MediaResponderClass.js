import fs from "fs";
import path from "path";
import mime from "mime";
import WorkingFile, { ProjectOpenMode } from "../workingFile";
import { buffer } from "stream/consumers";

/**
 * Generic media responder with range support (videos, images, audio, etc.)
 */
class MediaResponder {
  constructor(request, currentProject) {
    this.request = request;
    /**
     * @type {WorkingFile}
     */
    this.currentProject = currentProject;
    this.headers = new Headers();
    this.rangeText = request.headers.get("range");
    this.status = 200;
  }

  async handle() {
    const requestURL = new URL(this.request.url);
    const decodedPath = decodeURIComponent(requestURL.pathname || "");
    const fromPath = decodedPath.replace(/^\/+/, "");
    const fromHost = decodeURIComponent(requestURL.hostname || "");

    // Support both media://local/file.ext and legacy media://file.ext URLs.
    const filePath =
      fromPath || (fromHost && fromHost !== "local" ? fromHost : "");
    const baseName = path.posix.basename(filePath);
    const ext = path.extname(baseName);

    const mimeType = mime.getType(ext) || "application/octet-stream";
    this.headers.set("Content-Type", mimeType);

    if (
      this.currentProject.projectMode !== ProjectOpenMode.PRESENT &&
      baseName
    ) {
      const localFile =
        this.currentProject.notInArchive[baseName]?.file ||
        path.join(this.currentProject.videosFolder, baseName);
      if (typeof localFile === "string") {
        return this.#respondFromFile(localFile);
      }
      if (localFile instanceof Uint8Array) {
        return this.#respondFromBuffer(localFile);
      }
    }

    const zipEntryPath = `videos/${baseName}`;
    console.log("Trying to get from zip:", zipEntryPath);

    const buf = await this.currentProject.fileStream(zipEntryPath);
    return this.#respondFromBuffer(buf);
  }

  #parseRange(size) {
    if (!this.rangeText) return null;
    const match = this.rangeText.match(/bytes=(\d+)-(\d*)/);
    if (!match) return null;
    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : size - 1;
    if (start >= size || end >= size) return null;
    return {
      start,
      end,
      length: end - start + 1,
      rangeHeader: `bytes ${start}-${end}/${size}`,
    };
  }

  #respondFromFile(filePath) {
    try {
      const stat = fs.statSync(filePath);
      const totalSize = stat.size;
      const range = this.#parseRange(totalSize);

      if (range) {
        this.headers.set("Accept-Ranges", "bytes");
        this.headers.set("Content-Length", `${range.length}`);
        this.headers.set("Content-Range", range.rangeHeader);
        this.status = 206;
        const stream = fs.createReadStream(filePath, {
          start: range.start,
          end: range.end,
        });
        return new Response(stream, {
          headers: this.headers,
          status: this.status,
        });
      }

      this.headers.set("Content-Length", `${totalSize}`);
      const stream = fs.createReadStream(filePath);
      return new Response(stream, {
        headers: this.headers,
        status: this.status,
      });
    } catch (e) {
      console.log("Error 404 ", filePath);
      return new Response("Not Found", {
        status: 404,
        headers: { "content-type": "text/html" },
      });
    }
  }

  #respondFromBuffer(buffer) {
    const totalSize = buffer.length;
    const range = this.#parseRange(totalSize);

    if (range) {
      this.headers.set("Accept-Ranges", "bytes");
      this.headers.set("Content-Length", `${range.length}`);
      this.headers.set("Content-Range", range.rangeHeader);
      this.status = 206;
      return new Response(buffer.subarray(range.start, range.end), {
        headers: this.headers,
        status: this.status,
      });
    }

    this.headers.set("Content-Length", `${totalSize}`);
    return new Response(buffer, { headers: this.headers, status: this.status });
  }
}

export default MediaResponder;
