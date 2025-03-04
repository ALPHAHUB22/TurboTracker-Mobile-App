<template>
  <q-page-container>
    <IntroPanel />
    <!-- <div class="row q-px-lg justify-between q-gutter-lg q-mt-xs">
      <q-card class="col-3 row column justify-center items-center">
        <q-icon class="add-icon" size="lg" name="add" />
      </q-card>
      <q-card class="col-3 column q-pl-sm">
        <q-icon class="col icon" size="sm" name="bi-diagram-2" />
        <div class="text-caption q-ml-xs q-mt-xs">
          <div ><strong>566</strong></div>
          <div style="font-size:10px">Items</div>
        </div>
      </q-card>
      <q-card class="col-3 column q-pl-sm">
        <q-icon class="col icon" size="sm" name="domain" />
        <div class="text-caption q-ml-xs q-mt-xs">
          <div ><strong>566</strong></div>
          <div style="font-size:10px">Buildings</div>
        </div>
      </q-card>
    </div> -->
    <div class="grid-container">
      <q-card class="row column justify-center items-center" style="flex-grow: 1">
        <q-icon class="add-icon" size="lg" name="add" />
      </q-card>
      <q-card class="col-3 column q-pl-sm"  style="flex-grow: 1">
        <q-icon class="col icon" size="sm" name="bi-diagram-2" />
        <div class="text-caption q-ml-xs q-mt-xs">
          <div ><strong>566</strong></div>
          <div style="font-size:10px">Items</div>
        </div>
      </q-card>
      <q-card class="col-3 column q-pl-sm" style="flex-grow: 1">
        <q-icon class="col icon" size="sm" name="domain" />
        <div class="text-caption q-ml-xs q-mt-xs">
          <div ><strong>566</strong></div>
          <div style="font-size:10px">Buildings</div>
        </div>
      </q-card>
    </div>
    <!-- <QuickLinks title="Quick Links" :items="quickLinksSolo" /> -->
    <BuildingQuickLinks title="Recent Buildings" :items="buildingList" />
    <div class="text-center">
      <p>For adding new building, please contact System Admin</p>
    </div>
  </q-page-container>
</template>
<script setup>
import Expansion from 'components/Expansion.vue'
import Card from 'components/Card.vue'
import IntroPanel from 'components/IntroPanel.vue'
import QuickLinks from 'components/QuickLinks.vue'
import BuildingQuickLinks from 'components/BuildingQuickLinks.vue'
import { buildingList } from 'src/data/inventory.js'

console.log(buildingList[0])
const quickLinksSolo = [
  {
    title: "+ Add Item",
    route: "InventoryLogForm",
  }
]
</script>
<style lang="css">
.add-icon {
  border-radius: 7px;
  padding: 5px;
  color: #42C2FF;
  background-color: #d1eff9;
}
.icon {
  border-radius: 7px;
  margin-top: 10px;
  padding: 5px;
  color: #42C2FF;
  background-color: #d1eff9;
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
  gap: 10px; /* Optional spacing */
}
</style>
