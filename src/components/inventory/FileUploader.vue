<template>
  <div class="col-12 column items-center">
    <q-btn @click="captureImage" color="green-7" style="width: 100%;">
      <q-icon name="bi-paperclip" size="xs" />Attachments
      <q-badge v-if="attachment_len.value" color="red" floating left>{{ attachment_len }}</q-badge></q-btn>
  </div>
  <div class="col-12 row q-gutter-md q-mt-md justify-around">
    <div v-for="image in attachments" class="col-3">
      <q-icon name="close" class="h-5 w-5 text-gray-700" style="float:right"
        @click="() => confirmDeleteAttachment(image)" />
      <q-img @click="() => { isPreview = true; previewAttachment=image }" ratio="1" :src="image.url" />
    </div>
  </div>
  <FilePreview v-if="isPreview" v-model:isPreview="isPreview" v-model:previewAttachment="previewAttachment"  />
  <q-dialog v-model="deleteDialog" :backdrop-filter="'hue-rotate(120deg)'">
    <q-card>
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
          <q-btn color="primary" class="text-caption" v-close-popup>Cancel</q-btn>
          <q-btn class="text-caption" style="border: 1px solid red;" :loading="delLoading" @click="deleteAttachment(delDialogInfo)" >
            <q-icon color="red" size="20px" name="bi-trash"></q-icon>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>
<script setup>
import {ref, watch} from 'vue'
import { apiClient } from 'src/boot/axios';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import FilePreview from 'components/inventory/FilePreview.vue'

const props = defineProps(['attachments']);
const emit = defineEmits(['update:attachments']);
const attachment_len = ref(props.attachments.length)
const deleteDialog = ref(false)
const delDialogInfo = ref({})
const delLoading = ref(false)
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

    props.attachments.push(attachment)
    console.log(props.attachments)
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

async function upload_attachments(content, fileName){
  const data = JSON.stringify({
    content: content,
    filename: fileName
  })
  const response = await apiClient.post('/api/method/turbotracker.api.upload_base64_file', data);
  return response.data.message
}

function confirmDeleteAttachment(image){
  deleteDialog.value = true
  delDialogInfo.value = image
}

async function deleteAttachment(image){
  delLoading.value = true
  const response = await apiClient.post('/api/method/turbotracker.mobile_integ.inventory.delete_attachment', {"name": image.id});
  const updatedAttachments = props.attachments.filter(item => item.id !== image.id);
  emit('update:attachments', updatedAttachments);
  console.log(props.attachments)
  delLoading.value = false
  deleteDialog.value = false
}

watch(
  () => props.attachments,
  (value) => {
    attachment_len.value = ref(value.length)
  },
  {deep:true}
)

</script>
