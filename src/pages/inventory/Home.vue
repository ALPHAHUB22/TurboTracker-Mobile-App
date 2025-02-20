<template>
  <q-page-container>
    <IntroPanel />
    <QuickLinks title="Quick Links" :items="quickLinksSolo" />
    <BuildingQuickLinks title="Recent Warehouses" :items="buildingList" />
    <div class="text-center">
      <p>For adding new warehouse, please contact System Admin</p>
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
    route: "InventoryLogFormView",
  }
]

</script>
