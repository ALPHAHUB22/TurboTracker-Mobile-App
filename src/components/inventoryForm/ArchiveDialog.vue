<template>
  <q-dialog v-model="isArchiveDialog" :backdrop-filter="'blur(4px) saturate(150%)'">
    <q-card style="border-radius: 10px;">
      <q-card-section class="row items-center q-pb-none text-bold">
          Archive
        </q-card-section>
        <q-card-section class="row items-center">
          <!-- <q-avatar icon="signal_wifi_off" color="primary" text-color="white" /> -->
          <p class="q-ml-sm text-caption">
            Are you sure you want to archive
            <span class="text-bold">{{ id }}</span>
            ?
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn class="text-caption cancel-btn" @click="cancelDialog">Cancel</q-btn>
          <q-btn class="text-caption confirm-btn" :loading="delLoading" @click="archiveLog()" >
            <q-icon size="20px" name="archive"></q-icon>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>
<script setup>
import {ref, watch, inject } from 'vue'
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import { apiClient } from 'src/boot/axios';
import { apiRequest } from 'src/boot/http.js';
import { isOnline } from 'src/boot/network';

const router = useRouter();
const storageServ = inject('storageServ');
const props = defineProps(['isArchiveDialog',"id"]);
const emit = defineEmits(['update:isArchiveDialog', "isArchive"]);
const isArchiveDialog = ref(props.isArchiveDialog)
async function archiveLog(){
  try {
    const params = {
      "name": props.id,
      "archive_status": true
    }
    let response
    if (isOnline.value){
      response = await updateArchiveOnline(params)
    }
    else{
      response = await storageServ.updateArchiveOffline(params)
    }
    Notify.create({
      color: 'green-5',
      textColor: 'white',
      icon: 'cloud_done',
      message: `Inventory Log ${props.id} has successfully archived`
    })
    emit('update:isArchive', true);
    router.push({"name": "InventoryLogList"})
  }
  catch(error){
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: `API Error:' ${error.response?.data?.exception || error.message}`
    })
  }
}

function cancelDialog(){
  emit('update:isArchiveDialog', false);
}

watch(
  () => isArchiveDialog.value,
  (value) => {
    cancelDialog()
  }
)
</script>
