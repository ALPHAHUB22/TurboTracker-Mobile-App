<template>
  <q-dialog v-model="isPreview" :backdrop-filter="'blur(4px) saturate(150%)'">
    <q-card>
      <img :src="previewAttachment.download_url">
      <q-card-actions align="right">
        <q-btn class="text-caption" style="border: 1px solid red;" :loading="delLoading" @click="() => confirmDeleteAttachment(previewAttachment)" >
            <q-icon color="red" size="20px" name="bi-trash"></q-icon>
          </q-btn>
        <q-btn class="text-caption" style="border: 1px solid black;" :loading="downloadLoading"
          @click="downloadFile(previewAttachment.download_url)">
          <q-icon size="20px" name="bi-download"></q-icon>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
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
import { ref, watch } from 'vue'
import { apiClient } from 'src/boot/axios';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const props = defineProps(['isPreview', 'previewAttachment', 'attachments']);
const emit = defineEmits(['update:isPreview', "previewAttachment", "update:attachments"]);
const isPreview = ref(props.isPreview)
const downloadLoading = ref(false)
const deleteDialog = ref(false)
const delDialogInfo = ref({})
const delLoading = ref(false)
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

function confirmDeleteAttachment(image){
  deleteDialog.value = true
  delDialogInfo.value = image
}

async function deleteAttachment(image){
  delLoading.value = true
  const response = await apiClient.post('/api/method/turbotracker.mobile_integ.inventory.delete_attachment', {"name": image.id});
  const updatedAttachments = props.attachments.value.filter(item => item.id !== image.id);
  // emit('update:attachments', updatedAttachments);
  delLoading.value = false
  deleteDialog.value = false
}

watch(
  () => isPreview.value,
  (value) => {
    if (!value){
      cancelDialog()
      deleteDialog.value = false
    }
  }
)

</script>
