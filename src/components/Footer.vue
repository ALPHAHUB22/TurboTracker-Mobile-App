<template>
  <q-footer style="border-top-left-radius: 12px; border-top-right-radius: 12px;">
    <q-tabs v-model="tab" style="border-top-left-radius: 12px; border-top-right-radius: 12px;padding-top: 2px;">
      <q-route-tab style="width: 50%;" name="home" :to="homeRoute" :icon="tab === 'home' ? 'bi-house-fill': 'bi-house'" ></q-route-tab>
      <q-route-tab style="width: 50%;" name="inventory" :to="inventoryRoute" :icon="tab === 'inventory' ? 'bi-box-fill': 'bi-box'" ></q-route-tab>
    </q-tabs>
  </q-footer>
</template>
<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router';

const route = useRoute();
const tab = ref("home")
const homeRoute = ref("/")
const inventoryRoute = ref(route.params.filter ? `/inventory/building/${encodeURIComponent(route.params.filter)}` : "/inventory")

</script>
<style lang="css">
.q-tabs{
  background-color: white;
  color: #42C2FF;
}
</style>
