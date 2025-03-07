<template>
  <div class="grid-container">
    <q-card v-ripple class="row column justify-center items-center" clickable
      @click="$router.push({ name: 'InventoryLogForm' });" style="flex-grow: 1">
      <q-icon class="add-icon" size="lg" name="add" />
      </q-card>
      <q-card v-ripple class="col-3 column q-pl-sm" style="flex-grow: 1">
        <q-icon class="col icon" size="sm" name="bi-diagram-2" />
        <div class="text-caption q-ml-xs q-mt-xs">
          <div><strong>{{ itemCount }}</strong></div>
          <div style="font-size:10px">Items</div>
        </div>
      </q-card>
      <q-card v-ripple class="col-3 column q-pl-sm" style="flex-grow: 1">
        <q-icon class="col icon" size="sm" name="domain" />
        <div class="text-caption q-ml-xs q-mt-xs">
          <div><strong>{{ buildingCount }}</strong></div>
          <div style="font-size:10px">Buildings</div>
        </div>
      </q-card>
  </div>
</template>
<script setup>
import {ref, onMounted} from 'vue'
import { getDashInfo } from 'src/data/inventory.js'

const itemCount = ref(0)
const buildingCount = ref(0)
const dashInfoList = ref([])

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.value = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

onMounted(async()=> {
  dashInfoList.value = await getDashInfo()
  animateValue(itemCount, 0, dashInfoList.value.item, 500);
  animateValue(buildingCount, 0, dashInfoList.value.building, 500);
})
</script>
<style lang="css">
.add-icon {
  border-radius: 7px;
  padding: 5px;
  color: #42C2FF;
  background-color: #e6f9ff;
}

.icon {
  border-radius: 7px;
  margin-top: 10px;
  padding: 5px;
  color: #42C2FF;
  background-color: #e6f9ff;
}

.column {
  padding-top: 1px;
}

.q-card {
  border-radius: 15px;
}

.grid-container {
  padding-top: 10px;
  padding-bottom: 17px;
  margin-inline: 25px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  /* Optional spacing */
}

.grid-container>.column {
  border: 1px solid #42C2FF;
}
</style>
