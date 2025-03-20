<template>
<!-- <q-card> -->
  <div class="q-px-md" v-if="nextSyncTime">
    <div><strong>Sync</strong></div>
  <div class="q-pa-md row items-start">
    <div class="my-card q-gutter-sm" style="width: 100%;">
      <q-card style="border: 1px solid #42C2FF;">
        <q-card-section class="text-center row items-center">
          <!-- <div class="text-subtitle2 text-bold">Hey, {{userInfo.name}}</div> -->
          <div class="col text-caption">
            Sync within: <strong>{{ timeRemaining }}</strong>
          </div>
          <q-btn rounded class="col-2 confirm-btn" icon="sync" @click="syncDialog()">
            <q-dialog v-model="isSyncDialog" :backdrop-filter="'blur(4px) saturate(150%)'">
              <q-card style="border-radius: 10px;">
                <q-card-section class="row items-center q-pb-none text-bold">
                  Sync
                </q-card-section>
                <q-card-section class="row items-center">
                  <!-- <q-avatar icon="signal_wifi_off" color="primary" text-color="white" /> -->
                  <p class="q-ml-sm text-caption">
                    Would you like to sync the local inventory & photos to the server while keeping a copy on your device?
                  </p>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn class="text-caption cancel-btn" @click="syncOnly()">
                    <q-icon size="20px" name="sync"/>Sync Only
                  </q-btn>
                  <q-btn class="text-caption confirm-btn" label="Sync & Clear" @click="() => { isSyncClearDialog = true}">
                    <q-dialog v-model="isSyncClearDialog">
                      <q-card style="border-radius: 10px;">
                        <q-card-section class="row items-center q-pb-none text-bold">
                          Sync & Clear
                        </q-card-section>
                        <q-card-section class="row items-center">
                          <!-- <q-avatar icon="signal_wifi_off" color="primary" text-color="white" /> -->
                          <p class="q-ml-sm text-caption">
                            Are you sure you want to sync the local inventory and photos to the server and delete all copies, including captured photos, from your device?
                          </p>
                        </q-card-section>
                        <q-card-actions align="right">
                          <q-btn class="text-caption cancel-btn" v-close-popup>Cancel</q-btn>
                          <q-btn class="text-caption confirm-btn" @click="syncAndClear()">
                            <q-icon size="20px" name="sync"></q-icon>Yes
                          </q-btn>
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                  </q-btn>
                </q-card-actions>
              </q-card>
            </q-dialog>
          </q-btn>
        </q-card-section>
      </q-card>
    </div>

  </div>
  </div>
<!-- </q-card> -->
</template>
<script setup>
import { ref, onMounted, onUnmounted, inject, watch } from 'vue'
import { Preferences } from '@capacitor/preferences';
import { syncToServer } from 'src/data/inventory.js'
import { clearLocal } from 'src/data/profile.js'
import { Notify } from 'quasar';
import { isOnline } from 'src/boot/network';

const storageServ = inject("storageServ")
const nextSyncTime = ref("")
const timeRemaining = ref("");
const isSyncDialog = ref(false)
const isSyncClearDialog = ref(false)
let timerInterval;

const updateTimer = () => {
  // Parse the target time (MM/DD/YYYY h:mm A format)
  const now = new Date().getTime();
  const targetTime = new Date(nextSyncTime.value).getTime();
  const diffMs = targetTime - now;

  if (diffMs <= 0) {
    timeRemaining.value = "00h 00m 00s";
    clearInterval(timerInterval);
    return;
  }
  // Convert milliseconds to hours, minutes, and seconds
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  timeRemaining.value = `${hours}h ${minutes}m ${seconds}s`;
}

async function syncOnly(isClear=false){
  try{
    const offlineInventoryRecords = await storageServ.getUpdatedInventoryRecords()
    const response = await syncToServer(offlineInventoryRecords)
    console.log(response)
    if (!response.status){
      Notify.create({
        color: 'red-5',
        textColor: 'white',
        icon: 'warning',
        message: `Sync Error: ${response.message}`
      })
      return false
    }
    await storageServ.updateSyncedRecords(response.data)
    await Preferences.remove({ key: 'nextSyncTime' })
    if(!isClear){
      Notify.create({
        color: 'green-5',
        textColor: 'white',
        icon: 'cloud_done',
        message: `Successfully synced`
      })
    }
    isSyncDialog.value = false
    nextSyncTime.value = ""
    await Preferences.set({key: 'syncStatus', value: true})
  }
  catch(error){
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: `Sync Error:' ${error.response?.data?.exception || error.message}`
    })
  }
}

async function syncAndClear() {
  await syncOnly(true)
  await clearLocal(storageServ)
  isSyncClearDialog.value = false
  Notify.create({
    color: 'green-5',
    textColor: 'white',
    icon: 'cloud_done',
    message: `Successfully synced and cleared`
  })
}

function syncDialog(){
  if(isOnline.value){
    isSyncDialog.value = true
  }
  else{
    Notify.create({
      color: 'red-4',
      textColor: 'white',
      icon: 'warning',
      message: `Please connect to the network to sync to the server`
    })
  }
}

watch(
  () => isOnline.value,
  async(value) => {
    if (!value){
      isSyncDialog.value = false
      isSyncClearDialog.value = false
    }
    // prompt.value = false
    // get_building_list()
    // setOfflineBuilding()
  }
)

onMounted(async () => {
  nextSyncTime.value = (await Preferences.get({ key: 'nextSyncTime' })).value;
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000); // Update every second
});
onUnmounted(() => {
  clearInterval(timerInterval);
});
</script>
