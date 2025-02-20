<template>
  <q-footer>
    <q-tabs v-model="tab" style="height: 55px;">
      <q-route-tab class="q-pb-xl" style="width: 50%;" name="home" to="/" icon="home" label="Home"></q-route-tab>
      <q-route-tab class="q-pb-xl" style="width: 50%;" name="InventoryLogList" to="/inventory" icon="timeline" label="Inventory"></q-route-tab>
    </q-tabs>
  </q-footer>
</template>
<script setup>
import { ref } from 'vue'

const tab = ref("home")
</script>
