class Utils {
  constructor(parameters) {}

  /**
   * Create video thumbnail
   * @param {string} basePath
   * @param {number} thumbAtPercent
   * @return {Promise<string>} base64 Image
   */

  static createVideoCoverImage(filePath, thumbAtPercent = 0.2) {
    return new Promise((resolve, reject) => {
      // define a canvas to have the same dimension as the video
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 1920;
      canvas.height = 1080;

      // load the file to a video player
      const videoPlayer = document.createElement("video");
      videoPlayer.setAttribute("src", "file://" + filePath);
      videoPlayer.load();
      videoPlayer.addEventListener("error", (ex) => {
        reject("error when loading video file", ex);
      });
      // load metadata of the video to get video duration and dimensions
      videoPlayer.addEventListener("loadedmetadata", () => {
        // seek to user defined timestamp (in seconds) if possible
        if (videoPlayer.duration < thumbAtPercent) {
          reject("video is too short.");
          return;
        }
        // delay seeking or else 'seeked' event won't fire on Safari
        setTimeout(() => {
          videoPlayer.currentTime = videoPlayer.duration * thumbAtPercent;
        }, 200);
        // extract video thumbnail once seeking is complete
        videoPlayer.addEventListener("seeked", () => {
          console.log("video is now paused at %ss.", thumbAtPercent);
          // draw the video frame to canvas
          ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/" + this.videoThumbnailFormat, 0.8));
        });
      });
    });
  }

  // Helper functions for calculating bounding boxes
  static getCorner(pivotX, pivotY, diffX, diffY, angle) {
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    // Find angle from pivot to corner
    angle += Math.atan2(diffY, diffX);

    // Get new x and y coordinates
    const x = pivotX + distance * Math.cos(angle);
    const y = pivotY + distance * Math.sin(angle);

    return { x, y };
  }

  // Calculate client rect accounting for rotation
  static getClientRect(rotatedBox) {
    const { x, y, width, height } = rotatedBox;
    const rad = rotatedBox.rotation;

    const p1 = this.getCorner(x, y, 0, 0, rad);
    const p2 = this.getCorner(x, y, width, 0, rad);
    const p3 = this.getCorner(x, y, width, height, rad);
    const p4 = this.getCorner(x, y, 0, height, rad);

    const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
    const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
    const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
    const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  // Calculate total bounding box of multiple shapes
  static getTotalBox(boxes) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    boxes.forEach((box) => {
      minX = Math.min(minX, box.x);
      minY = Math.min(minY, box.y);
      maxX = Math.max(maxX, box.x + box.width);
      maxY = Math.max(maxY, box.y + box.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}

module.exports = Utils;
