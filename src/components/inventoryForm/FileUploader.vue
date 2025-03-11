<template>
  <!-- <div class="col-12 column items-center">
    <q-btn @click="captureImage" color="green-7" style="width: 100%;">
      <q-icon name="bi-paperclip" size="xs" />Attachments
      <q-badge v-if="attachment_len.value" color="red" floating left>{{ attachment_len }}</q-badge></q-btn>
  </div> -->
  <div class="col-12 row items-center q-gutter-x-sm q-my-md">
    <div class="text-h6">Attachments</div>
    <q-badge v-if="attachment_len.value" style="background-color: #42C2FF;">{{ attachment_len }}</q-badge>
  </div>
  <div class="col-12" style="display: flex; flex-wrap: wrap; padding-left: 1vh;">
    <q-img class="attachment" v-for="image in attachments"
      @click="() => { isPreview = true; previewAttachment = image }" :src="image.url" />
    <q-card class="row column justify-center items-center attachment" @click="captureImage"
      style="border: 1px dashed ;background-color: #e6f9ff;">
      <q-icon class="add-icon" size="lg" name="add" />
    </q-card>
  </div>
  <!-- <FilePreview v-if="isPreview" v-model:isPreview="isPreview" v-model:previewAttachment="previewAttachment" v-model:attachments="props.attachments" /> -->
  <q-dialog v-model="isPreview" :backdrop-filter="'blur(4px) saturate(150%)'">
    <q-card style="border-radius: 10px;">
      <q-card-actions style="position: absolute; right: 0%;z-index: 1;">
        <q-btn class="text-caption" size="md" style="border: 1px solid red; background-color: red;" :loading="delLoading"
          @click="() => confirmDeleteAttachment(previewAttachment)">
          <q-icon color="white" name="bi-trash"></q-icon>
        </q-btn>
        <q-btn class="text-caption download-btn" size="md" :loading="downloadLoading"
          @click="downloadFile(previewAttachment.download_url)">
          <q-icon name="bi-download"></q-icon>
        </q-btn>
      </q-card-actions>
      <img :src="previewAttachment.download_url">
    </q-card>
  </q-dialog>
  <q-dialog v-model="deleteDialog" :backdrop-filter="'blur(4px) saturate(150%)'">
    <q-card style="border-radius: 10px;">
      <q-card-section class="row items-center q-pb-none text-bold">
        Delete Attachment
      </q-card-section>
      <q-card-section class="row items-center">
        <!-- <q-avatar icon="signal_wifi_off" color="primary" text-color="white" /> -->
        <p class="q-ml-sm text-caption">
          Are you sure you want to delete the attachment
          <span class="text-bold">{{ delDialogInfo.file_name }}</span>
          ?
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn class="text-caption cancel-btn" v-close-popup>Cancel</q-btn>
        <q-btn class="text-caption confirm-del-btn" :loading="confirmDelLoading"
          @click="deleteAttachment(delDialogInfo)">
          <q-icon size="20px" name="bi-trash"></q-icon>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>
<script setup>
import { ref, watch } from 'vue'
import { apiClient } from 'src/boot/axios';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import FilePreview from 'src/components/inventoryForm/FilePreview.vue'
import { apiRequest } from 'src/boot/http.js';

const props = defineProps(['attachments', 'id']);
const emit = defineEmits(['update:attachments']);
const attachment_len = ref(props.attachments.length)
const isPreview = ref(false)
const previewAttachment = ref({})

const captureImage = async () => {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl, // Base64 image
      source: CameraSource.Camera, // Use Camera (or use `Photos` for gallery)
      quality: 90 // Image quality
    })
    const { base64Content, fileName } = extractBase64(photo.dataUrl);
    const attachment = await upload_attachments(base64Content, fileName)
    console.log(attachment)
    props.attachments.push(attachment)
  } catch (error) {
    console.error('Camera error:', error)
  }
}

const extractBase64 = (dataUrl) => {
  const mimeType = dataUrl.match(/data:([^;]+);base64/)[1]; // Get MIME type
  const base64Content = dataUrl.split(",")[1]; // Extract Base64 string
  const fileExtension = mimeType.split("/")[1]; // "jpeg" or "png"
  const fileName = `file_${Date.now()}.${fileExtension}`; // Generate a filename

  return { base64Content, fileName };
};

async function upload_attachments(content, fileName) {
  let attachedTo = {
    dt: "Inventory Log",
    dn: props.id
  }
  let data = {
    content: content,
    filename: fileName,
  }
  if (props.id) Object.assign(data, attachedTo);
  data = JSON.stringify(data)
  const response = await apiRequest.post('/api/method/turbotracker.api.upload_base64_file', data);
  return response.message
}

watch(
  () => props.attachments,
  (value) => {
    attachment_len.value = ref(value.length)
  },
  { deep: true }
)

const downloadLoading = ref(false)
const deleteDialog = ref(false)
const delDialogInfo = ref({})
const delLoading = ref(false)
const confirmDelLoading = ref(false)
function cancelPreviewDialog() {
  isPreview.value = false
}

function cancelDeleteDialog() {
  deleteDialog.value = false
}

const downloadFile = (url) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = ""; // Browser will automatically determine filename
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function confirmDeleteAttachment(image) {
  deleteDialog.value = true
  delDialogInfo.value = image
}

async function deleteAttachment(image) {
  confirmDelLoading.value = true
  const response = await apiRequest.post('/api/method/turbotracker.mobile_integ.inventory.delete_attachment', { "name": image.id });
  const updatedAttachments = props.attachments.filter(item => item.id !== image.id);
  emit('update:attachments', updatedAttachments);
  confirmDelLoading.value = false
  cancelPreviewDialog()
  cancelDeleteDialog()
}

watch(
  () => isPreview.value,
  (value) => {
    if (!value) {
      cancelPreviewDialog()
      cancelDeleteDialog()
    }
  }
)

</script>
<style>
.attachment {
  margin: 4px;
  width: 75px;
  border-radius: 10px;
  height: 9vh;
}

.add-icon {
  /* padding: 5px; */
  color: #42C2FF;
}

.download-btn {
  background-color: #42C2FF;
  color: white;
}

.cancel-btn {
  border: 1px solid #42C2FF;
  background-color: white;
  color: #42C2FF;
}

.confirm-del-btn {
  color: white;
  background-color: red;
}
</style>
