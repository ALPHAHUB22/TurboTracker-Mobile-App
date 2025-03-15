<template>
  <div class="q-ma-md">
    {{isOnline}}
  <q-input v-model="pathName"></q-input>
  <div>{{ foldermsg }}</div>
  <q-btn @click="createFolder()">Create Folder</q-btn>
  <q-btn @click="captureAndStoreImage()">Capture and Store</q-btn>
  <q-btn @click="listImages()">List Images</q-btn>
  <div>{{ imageList }}</div>
  <q-input v-model="imageName"></q-input>
  <img id="imageDisplay" alt="Captured Image" width=200 />
  <q-btn @click="loadImage()">Load Image</q-btn>
  <div>{{ paths }}</div>
  <div>{{dire}}</div>
</div>
</template>
<script setup>
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ref, computed } from 'vue';
import { isOnline } from 'src/boot/network';

console.log(isOnline.value ? '✅ Online' : '❌ Offline');
const paths = ref([])
const dire = ref([])
const pathName = ref(null)
const foldermsg = ref(null)
const getAllDirs = async () => {
  const directories = [Directory.Documents, Directory.Data, Directory.Cache];
  let path = []
  for (const dir of directories) {
    try {
      const result = await Filesystem.getUri({ path: ".", directory: dir });
      path.push(`${dir} Path:`, result.uri)
      console.log(`${dir} Path:`, result.uri);
    } catch (error) {
      console.error(`Error getting ${dir} directory:`, error);
    }
  }
  dire.value = path
};

getAllDirs();

const listFiles = async (path = '') => {
  try {
    const result = await Filesystem.readdir({
      path: `${pathName.value}`, // Path relative to the given directory
      directory: Directory.Documents, // Choose Directory (Data, Documents, etc.)
    });

    console.log("Files & Folders:", result.files);
    paths.value = result.files
    return result.files; // Returns an array of file/folder names
  } catch (error) {
    console.error("Error reading directory:", error);
  }
};
async function createFolder() {
  try {
    if (pathName.value){
      await Filesystem.mkdir({
        path: pathName.value,
        directory: Directory.Documents, // Use Documents or other available directories
        recursive: true, // Creates parent directories if they don't exist
      });
      foldermsg.value = `Folder '${pathName.value}' created successfully!`
      console.log(`Folder '${pathName.value}' created successfully!`);
    }
  } catch (error) {
    console.error('Error creating folder:', error);
  }
}

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

async function captureImage() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    return image.base64String; // Return base64 data
  } catch (error) {
    console.error("Error capturing image:", error);
    return null;
  }
}

async function saveImage(base64Data, folderName, fileName) {
  try {
    // Create folder if it doesn't exist
    await Filesystem.mkdir({
      path: folderName,
      directory: Directory.Documents,
      recursive: true,
    });

    // Save the image file
    await Filesystem.writeFile({
      path: `${folderName}/${fileName}`,
      data: base64Data,
      directory: Directory.Documents,
    });

    console.log("Image saved successfully!");
  } catch (error) {
    console.error("Error saving image:", error);
  }
}

async function captureAndStoreImage() {
  const base64Data = await captureImage();
  if (base64Data) {
    console.log(Date.now())
    await saveImage(base64Data, "MyImages", `image_${Date.now()}.jpg`);
  }
}
const imageList = ref([])
const imageName = computed(() => {
  if (imageList.value.length>0){
    return imageList.value[imageList.value.length-1].name
  }
})
async function listImages() {
  try {
    const files = await Filesystem.readdir({
      path: "MyImages",
      directory: Directory.Documents,
    });
    console.log("Saved images:", files.files);
    imageList.value = files.files
  } catch (error) {
    console.error("Error listing images:", error);
  }
}

async function loadImage(fileName) {
  try {
    console.log('IMAGE NAME', imageName.value)
    const file = await Filesystem.readFile({
      path: `MyImages/${imageName.value}`,
      directory: Directory.Documents,
    });

    const imageSrc = `data:image/jpeg;base64,${file.data}`;
    document.getElementById("imageDisplay").src = imageSrc;
  } catch (error) {
    console.error("Error loading image:", error);
  }
}



// Call the function
// createFolder('MyNewFolder');
</script>
