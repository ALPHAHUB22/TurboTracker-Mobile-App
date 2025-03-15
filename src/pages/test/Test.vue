<template>
  <!-- <q-page class="flex flex-center"> -->
    <q-btn @click="captureImage" label="Take Photo" color="primary" />
    <q-img v-if="image" :src="image" style="width: 200px; height: 200px;" class="q-mt-md" />
  <!-- </q-page> -->
</template>
<script setup>
import {ref} from "vue"
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const image = ref(null)

const captureImage = async () => {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl, // Base64 image
      source: CameraSource.Camera, // Use Camera (or use `Photos` for gallery)
      quality: 90 // Image quality
    })

    image.value = photo.dataUrl // Display image in <q-img>
  } catch (error) {
    console.error('Camera error:', error)
  }
}
</script>
