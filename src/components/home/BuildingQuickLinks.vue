<template>
  <div class="q-px-md">
    <div><strong>Recent Buildings</strong></div>
    <div class="q-pa-md row items-start">
      <div class="my-card q-gutter-sm" style="width: 100%;">
        <q-card v-for="link in buildings" :key="link.value"
          @click="$router.push({ name: link.route, params: { filter: link.value } })">
          <q-card-section class="q-pa-md row" style="background-color: white;">
            <div class="col-11">{{ link.value }}</div>
            <q-icon size="xs" class="col-1" name="keyboard_arrow_right" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { getOnlineDashBuildings } from 'src/data/inventory.js'
import { isOnline } from 'src/boot/network';

const storageServ = inject('storageServ');
const buildings = ref([])

watch(
  () => isOnline.value,
  async(value) => {
    getBuildingList()
  }
)

async function getBuildingList(){
  if (isOnline.value){
    buildings.value = await getOnlineDashBuildings()
  }
  else{
    const offlineBuildingName = await storageServ.getOfflineDashBuilding()
    if (offlineBuildingName){
      buildings.value = [{
        value: offlineBuildingName,
        route: "InventoryLogBuildingListView",
      }]
    }
  }
  console.log(buildings.value)
}

onMounted(async()=>{
  getBuildingList()
})
</script>
