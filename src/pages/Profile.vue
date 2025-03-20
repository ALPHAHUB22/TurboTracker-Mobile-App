<template>
  <q-layout view="lHh Lpr lFf" class="base-layout">
    <q-toolbar>
        <q-btn flat dense icon="keyboard_arrow_left" @click="$router.go(-1)" />
        <q-toolbar-title class="text-subtitle1">
          Profile
        </q-toolbar-title>
        <div :class="isOnline ? 'online' : 'offline'" class="q-mr-lg" ></div>
      </q-toolbar>
    <q-page-container>
  <div class="q-px-md">
      <q-card class="my-card">
        <img :src="userInfo?.profile_image">
      <q-card-section>
        <div class="text-h6 text-bold">Arun</div>
        <div class="text-subtitle2">arun.r@rivestonetech.com</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-btn :disable="isOnline ? false : true" label="Prepare for Offline" color="primary" @click="preparOfflineDialog()">
          <q-dialog v-model="prompt" persistent>
            <q-card style="min-width: 350px">
              <q-card-section>
                <div class="text-h6">Choose Building</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-select label="Select Building" v-model="building" use-input input-debounce="0"
                    @new-value="buildingCreateValue" clearable :options="buildingfilterOptions" @filter="buildingFilterFn" />
              </q-card-section>

              <q-card-actions align="right">
                <q-btn class="text-bold cancel-btn" v-close-popup >Cancel</q-btn>
                <q-btn class="text-bold confirm-btn" @click="initiateOffline" v-close-popup >
                  Confirm
                </q-btn>
              </q-card-actions>
            </q-card>
        </q-dialog>
        </q-btn>
        <div v-if="offlineBuilding">Offline: <strong>{{ offlineBuilding }}</strong></div>
        <!-- <div v-if="lastSyncTime">Last Sync Time: <strong>{{ lastSyncTime }}</strong></div> -->
      </q-card-section>
    </q-card>
  </div>
</q-page-container>
</q-layout>
</template>
<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { Preferences } from '@capacitor/preferences';
import { prepareToOffline } from 'src/data/profile';
import { isOnline } from 'src/boot/network';
import { getOnlineBuildings } from 'src/data/inventory.js'
import { Notify } from 'quasar'

let dbName = ""

const db = inject('dbConnection');
const storageServ = inject('storageServ');
const prompt = ref(false)
const buildingOptions = ref([])
const buildingfilterOptions = ref([])
const building = ref(null)
const offlineBuilding = ref("")
const lastSyncTime = ref("")
const userInfo = ref({})
// userInfo.user_image
const get_building_list = async () => {
  if (isOnline.value){
    const response = await getOnlineBuildings()
    console.log(response)
    // const response = await apiRequest.get('/api/resource/Warehouse?filters=[["custom_is_building", "=", 1]]&limit_start=0&limit_page_length=1000')
    buildingOptions.value = response
    buildingfilterOptions.value = buildingOptions.value
  }
}

function buildingCreateValue(val, done) {
  if (val.length > 0) {
    const modelValue = (building.value || []).slice()

    val
      .split(/[,;|]+/)
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .forEach(v => {
        if (buildingOptions.value.includes(v) === false) {
          buildingOptions.value.push(v)
        }
        if (modelValue.includes(v) === false) {
          modelValue.push(v)
        }
      })

    done(null)
    building.value = modelValue
  }
}

function buildingFilterFn(val, update) {
  update(() => {
    if (val === '') {
      buildingfilterOptions.value = buildingOptions.value
    }
    else {
      const needle = val.toLowerCase()
      buildingfilterOptions.value = buildingOptions.value.filter(
        v => v.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const initiateOffline = async() => {
  console.log(building.value)
  await prepareToOffline(db, storageServ, building.value)
  offlineBuilding.value = building.value

}

const preparOfflineDialog = async() =>{
  const syncStatus = (await Preferences.get({ key: 'syncStatus' })).value
  console.log(typeof syncStatus)
  if (!JSON.parse(syncStatus)){
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: `Please sync the locally captured inventories to the server before preparing for offline mode`
    })
    return false
  }
  prompt.value = !prompt.value
}

const setOfflineBuilding = async() => {
  const offlineBuildingName = await storageServ.getOfflineDashBuilding()
  offlineBuilding.value = offlineBuildingName
}

watch(
  () => isOnline.value,
  async(value) => {
    prompt.value = false
    get_building_list()
    setOfflineBuilding()
  }
)

onMounted(async() => {
  const db = await Preferences.get({ key: 'dbName' })
  dbName = db.value
  const user = await Preferences.get({ key: 'userInfo' })
  userInfo.value = JSON.parse(user.value)
  // await Preferences.remove({ key: 'lastSyncTime' });
  // await Preferences.remove({ key: 'nextSyncTime' });
  // await Preferences.remove({ key: 'localEditInitiate' });
  get_building_list()
  setOfflineBuilding()
})
</script>
