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
          <q-btn class="text-caption archive-btn" :loading="delLoading" @click="archiveLog()" >
            <q-icon size="20px" name="archive"></q-icon>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>
<script setup>
import {ref, watch} from 'vue'
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import { apiClient } from 'src/boot/axios';
const router = useRouter();

const props = defineProps(['isArchiveDialog',"id"]);
const emit = defineEmits(['update:isArchiveDialog', "isArchive"]);
const isArchiveDialog = ref(props.isArchiveDialog)
async function archiveLog(){
  try {
    const response = await apiClient.post('/api/method/turbotracker.mobile_integ.inventory.archive_log', {"name": props.id, "archive_status": true});
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
<style lang="css">
.cancel-btn{
  border: 1px solid #42C2FF;
  background-color: white;
  color: #42C2FF;
}
.archive-btn{
  background-color: #42C2FF;
  color: white;
}
</style>
