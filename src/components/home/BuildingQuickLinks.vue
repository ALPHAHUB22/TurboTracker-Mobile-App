<template>
  <div class="q-px-md">
    <div><strong>Recent Buildings</strong></div>
    <div class="q-pa-md row items-start">
      <div class="my-card q-gutter-sm" style="width: 100%;">
        <q-card v-for="link in buildings" :key="link.title"
          @click="$router.push({ name: link.route, params: { filter: link.value } })">
          <q-card-section class="q-pa-md row" style="background-color: white;">
            <div class="col-11">{{ link.title }}</div>
            <q-icon size="xs" class="col-1" name="keyboard_arrow_right" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getBuildings } from 'src/data/inventory.js'

const buildings = ref([])

onMounted(async()=>{
  buildings.value = await getBuildings()
})
</script>
