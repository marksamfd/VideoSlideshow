const fs = require("fs");
const path = require("path");

export default createDirectoryifNotExists = (appName) => {
  const directoryPath = path.join(__dirname, appName);

  try {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
      console.log(`Directory created: ${directoryPath}`);
      return directoryPath;
    } else {
      console.log(`Directory already exists: ${directoryPath}`);
    }
  } catch (err) {
    console.error(`Error creating directory: ${err}`);
  }
};
