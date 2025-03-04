<template>
  <q-footer style="border-top-left-radius: 12px; border-top-right-radius: 12px;">
    <q-tabs dense v-model="tab" style="border-top-left-radius: 12px; border-top-right-radius: 12px;padding-top: 2px;">
      <q-route-tab style="width: 50%;" name="home" to="/" icon="bi-house" label="Home"></q-route-tab>
      <q-route-tab style="width: 50%;" name="InventoryLogList" to="/inventory" icon="bi-box" label="Inventory"></q-route-tab>
    </q-tabs>
  </q-footer>
</template>
<script setup>
import { ref } from 'vue'

const tab = ref("home")
</script>
<style lang="css">
.q-tabs{
  background-color: white;
  color: #42C2FF;
}
</style>
