import { Filesystem, Directory } from '@capacitor/filesystem';


const baseDirectory = Directory.Documents
const appDirectory = "TurboTracker"
const imageFolder = "Images"

export async function checkDirectoryExists(directoryPath) {
  try {
    await Filesystem.readdir({
      path: `${directoryPath}`,
      directory: baseDirectory,
    });
    console.log(`✅ Directory "${directoryPath}" exists.`);
    return true;
  } catch (error) {
    console.log(`❌ Directory "${directoryPath}" does not exist.`);
    return false;
  }
}

export async function createNewDirectory(directoryName=null) {
  let path = `${appDirectory}/${directoryName}`
  if(directoryName === null){
    path = `${appDirectory}`
    directoryName = `${appDirectory}`
  }
  const exists = await checkDirectoryExists(path);
  if (!exists) {
    await Filesystem.mkdir({
      path: path,
      directory: baseDirectory,
      recursive: true,
    });
    console.log(`📂 Directory "${directoryName}" created.`);
  }
}

export async function saveImage(base64Data, fileName, folderName=imageFolder) {
  try {
    // Save the image file
    // console.log(base64Data)
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
    return fileUri.uri
  } catch (error) {
    console.error("Error saving image:", error);
  }
}

export async function loadImage(fileName, binary=false, folderName=imageFolder) {
  try {
    console.log("LOADPATH", `${appDirectory}/${folderName}/${fileName}`)
    const file = await Filesystem.readFile({
      path: `${appDirectory}/${folderName}/${fileName}`,
      directory: baseDirectory,
    });
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // Map extensions to MIME types
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      // Add more as needed
    };

    const mimeType = mimeTypes[fileExtension] || "application/octet-stream"; // Default to binary

    // Handle image files
    if (binary){
      const binaryData = new Uint8Array(atob(file.data).split("").map(c => c.charCodeAt(0)));
      console.log("LOADCONTENT", new Blob([binaryData], { type: mimeType }))
      return `${file.data}`
    }
    if (mimeType.startsWith("image/")) {
      return `data:${mimeType};base64,${file.data}`;
    }

    // const imageSrc = `data:image/jpeg;base64,${file.data}`;
    // return imageSrc
  } catch (error) {
    console.error("Error loading image:", error);
  }
}

export async function deleteImage(fileName, folderName = imageFolder) {
  try {
    const filePath = `${appDirectory}/${folderName}/${fileName}`;

    // Delete the file
    await Filesystem.deleteFile({
      path: filePath,
      directory: baseDirectory, // Use the same baseDirectory as in saveImage
    });

    console.log(`File deleted successfully: ${filePath}`);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

export async function deleteImagesInFolder(folderName = imageFolder) {
  try {
    const folderPath = `${appDirectory}/${folderName}`;

    // List all files in the folder
    const fileList = await Filesystem.readdir({
      path: folderPath,
      directory: baseDirectory, // Same as used in saveImage
    });
    
    // Delete each file inside the folder
    for (const file of fileList.files) {
      const filePath = `${folderPath}/${file.name}`;
      await Filesystem.deleteFile({
        path: filePath,
        directory: baseDirectory,
      });
      console.log(`Deleted file: ${filePath}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting files or folder:", error);
    return false;
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

export async function addNomedia(folderName) {
  await Filesystem.writeFile({
    path: `${appDirectory}/${folderName}/.nomedia`,
    data: '', // Empty content
    directory: baseDirectory,
  });
  console.log(`${appDirectory}/${folderName}/.nomedia`)
  console.log('.nomedia file created successfully!');
}