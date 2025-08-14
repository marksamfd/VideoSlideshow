const fs = require("fs");

function parseRangeRequests(text, size) {
  const token = text.split("=");
  if (token.length !== 2 || token[0] !== "bytes") {
    return [];
  }

  return token[1]
    .split(",")
    .map((v) => parseRange(v, size))
    .filter(([start, end]) => !isNaN(start) && !isNaN(end) && start <= end);
}

const NAN_ARRAY = [NaN, NaN];

function parseRange(text, size) {
  const token = text.split("-");
  if (token.length !== 2) {
    return NAN_ARRAY;
  }

  const startText = token[0].trim();
  const endText = token[1].trim();

  if (startText === "") {
    if (endText === "") {
      return NAN_ARRAY;
    } else {
      let start = size - Number(endText);
      if (start < 0) {
        start = 0;
      }

      return [start, size - 1];
    }
  } else {
    if (endText === "") {
      return [Number(startText), size - 1];
    } else {
      let end = Number(endText);
      if (end >= size) {
        end = size - 1;
      }

      return [Number(startText), end];
    }
  }
}

function buildRangeHeaders(rangeText, totalSize) {
  if (!rangeText) return null;
  const ranges = parseRangeRequests(rangeText, totalSize);
  const [start, end] = ranges[0];
  return {
    start,
    end,
    contentLength: end - start,
    contentRange: `bytes ${start}-${end}/${totalSize}`,
  };
}

function createVideoResponse(
  source,
  totalSize,
  rangeText,
  isStream = true,
  headers
) {
  
  headers.set("Accept-Ranges", "bytes");
  const range = buildRangeHeaders(rangeText, totalSize);
  let status = 200;
  let body;

  if (range) {
    headers.set("Content-Length", `${range.contentLength}`);
    headers.set("Content-Range", range.contentRange);
    status = 206;

    if (isStream) {
      body = fs.createReadStream(source, {
        start: range.start,
        end: range.end,
      });
    } else {
      body = source.subarray(range.start, range.end);
    }
  } else {
    headers.set("Content-Length", `${totalSize}`);
    body = isStream ? fs.createReadStream(source) : source;
  }

  return new Response(body, { headers, status });
}

module.exports = { createVideoResponse, buildRangeHeaders };
