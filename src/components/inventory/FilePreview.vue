<template>
  <q-dialog v-model="isPreview" :backdrop-filter="'blur(4px) saturate(150%)'">
    <q-card>
      <img :src="previewAttachment.download_url">
      <q-card-actions align="right">
        <q-btn color="primary" class="text-caption" v-close-popup>Cancel</q-btn>
        <q-btn class="text-caption" style="border: 1px solid black;" :loading="downloadLoading"
          @click="downloadFile(previewAttachment.download_url)">
          <q-icon size="20px" name="bi-download"></q-icon>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, watch } from 'vue'
import { apiClient } from 'src/boot/axios';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const props = defineProps(['isPreview', 'previewAttachment']);
const emit = defineEmits(['update:isPreview', "previewAttachment"]);
const isPreview = ref(props.isPreview)
console.log(props.previewAttachment)
const downloadLoading = ref(false)
function cancelDialog(){
  emit('update:isPreview', false);
}

const downloadFile = (url) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = ""; // Browser will automatically determine filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

watch(
  () => isPreview.value,
  (value) => {
    if (!value){
      cancelDialog()
    }
  }
)

</script>
