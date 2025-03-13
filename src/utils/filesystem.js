import { Filesystem, Directory } from '@capacitor/filesystem';


const baseDirectory = Directory.Documents
const appDirectory = "TurboTracker"
const imageFolder = "Images"

export async function checkDirectoryExists(directoryName) {
  try {
    await Filesystem.readdir({
      path: `${appDirectory}/${directoryName}`,
      directory: baseDirectory,
    });
    console.log(`✅ Directory "${directoryName}" exists.`);
    return true;
  } catch (error) {
    console.log(`❌ Directory "${directoryName}" does not exist.`);
    return false;
  }
}

export async function createNewDirectory(directoryName) {
  const exists = await checkDirectoryExists(directoryName);
  if (!exists) {
    await Filesystem.mkdir({
      path: `${appDirectory}/${directoryName}`,
      directory: baseDirectory,
      recursive: true,
    });
    console.log(`📂 Directory "${directoryName}" created.`);
  }
}

export async function saveImage(base64Data, folderName=imageFolder, fileName) {
  try {
    // Save the image file
    await Filesystem.writeFile({
      path: `${appDirectory}/${folderName}/${fileName}`,
      data: base64Data,
      directory: baseDirectory,
    });
    console.log("Image saved successfully!");
    const fileUri = await Filesystem.getUri({
      path: `${appDirectory}/${folderName}/${fileName}`,
      directory: baseDirectory,
    });
    return fileUri
  } catch (error) {
    console.error("Error saving image:", error);
  }
}

export async function loadImage(folderName=imageFolder, fileName) {
  try {
    const file = await Filesystem.readFile({
      path: `${appDirectory}/${folderName}/${fileName}`,
      directory: baseDirectory,
    });
    const imageSrc = `data:image/jpeg;base64,${file.data}`;
    return imageSrc
  } catch (error) {
    console.error("Error loading image:", error);
  }
}

export async function listDirectory(folderName=imageFolder) {
  try {
    const files = await Filesystem.readdir({
      path: `${appDirectory}/${folderName}`,
      directory: baseDirectory,
    });
    console.log("Saved images:", files.files);
    return files.files
  } catch (error) {
    console.error("Error listing images:", error);
  }
}