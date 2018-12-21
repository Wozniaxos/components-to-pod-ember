const fs = require("fs");
const path = require("path");
const process = require("process");

const baseLocation = "./";

const createDirectoryForFile = directoryToPush => {
  const splittedDirectoryToPush = directoryToPush.split("/");
  // It is because sometimes was situation that path before final path didn't exists.
  // For example wheb tried to create folder aa/bb/cc/dd and there werent aa/bb and aa/bb/cc locations
  splittedDirectoryToPush.reduce((directory, dirPart) => {
    directory = `${directory}/${dirPart}`;
    const directoryExists = fs.existsSync(directory);
    if (!directoryExists) {
      fs.mkdirSync(directory);
    }
    return directory;
  }, "./components");
};

const renameAndMoveComponent = (componentFilePath, folderPath, filePath) => {
  const extension = componentFilePath.split(".")[1];
  const componentPartName = extension === "hbs" ? "template.hbs" : `component.${extension}`;
  fs.renameSync(`./${filePath}`, `./components/${componentFilePath}/${componentPartName}`);
};

const read = location => fs.readdir(location, function(err, subjects) {
  if (location.includes("styles")) {
    return;
  }
  subjects.forEach(subject => {
    const currentSubjectLocation = `${location}/${subject}`;
    const isDirectory = fs.statSync(currentSubjectLocation).isDirectory();
    if (isDirectory) {
      // Read nested folders files
      const newLocation = `${location}/${subject}`;
      return read(newLocation);
    }
    const fileLocation = currentSubjectLocation;
    const filePath = path.relative(baseLocation, fileLocation);
    const isComponentPart = filePath.includes("components") && !filePath.includes("partials");
    if (isComponentPart) {
      const afterComponentsFilePathPart = filePath.split("components/")[1];
      const filePathNameToFolderPathName = afterComponentsFilePathPart.split(".")[0];
      createDirectoryForFile(filePathNameToFolderPathName);
      renameAndMoveComponent(afterComponentsFilePathPart, filePathNameToFolderPathName, filePath);
    }
  });
});

read(baseLocation);
