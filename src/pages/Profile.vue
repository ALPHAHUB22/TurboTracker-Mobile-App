<template>
  <q-layout view="lHh Lpr lFf">
    <q-toolbar>
        <q-btn flat dense icon="keyboard_arrow_left" @click="$router.go(-1)" />
        <q-toolbar-title class="text-subtitle1">
          Profile
        </q-toolbar-title>
      </q-toolbar>
    <q-page-container>
  <div class="q-px-md">
      <q-card class="my-card">
        <img src="https://cdn.quasar.dev/img/boy-avatar.png">
      <q-card-section>
        <div class="text-h6 text-bold">Arun</div>
        <div class="text-subtitle2">arun.r@rivestonetech.com</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-btn label="Prepare for Offline" color="primary" @click="prompt = !prompt">
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
                <q-btn class="text-bold cancel-btn" @click="" v-close-popup >Cancel</q-btn>
                <q-btn class="text-bold confirm-btn" @click="" v-close-popup >
                  Confirm
                </q-btn>
              </q-card-actions>
            </q-card>
        </q-dialog>
        </q-btn>
      </q-card-section>
    </q-card>
  </div>
</q-page-container>
</q-layout>
</template>
<script setup>
import { ref } from 'vue'
import { apiRequest } from 'src/boot/http.js';

const prompt = ref(false)
const buildingOptions = ref([])
const buildingfilterOptions = ref([])
const building = ref(null)

const get_building_list = async () => {
  const response = await apiRequest.get('/api/resource/Warehouse?filters=[["custom_is_building", "=", 1]]&limit_start=0&limit_page_length=1000')
  buildingOptions.value = response.data.map(row => row.name)
  buildingfilterOptions.value = buildingOptions.value
}
get_building_list()

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
</script>
