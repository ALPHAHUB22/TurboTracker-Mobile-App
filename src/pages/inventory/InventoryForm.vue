<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense icon="keyboard_arrow_left" aria-label="Menu" @click="$router.go(-1)" />
        <q-toolbar-title>
          New
        </q-toolbar-title>
        <q-btn flat icon="more_vert" color="white">
          <q-menu transition-show="flip-right" transition-hide="flip-left" :offset="[0, 5]">
            <q-list>
              <q-item clickable>
                <q-item-section>Archive</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page class="flex flex-center">
    <q-btn @click="captureImage" label="Take Photo" color="primary" />
    <q-img v-if="image" :src="image" style="width: 200px; height: 200px;" class="q-mt-md" />
  </q-page>
      <div class="q-pa-md">
        <div class="q-gutter-sm q-mb-xl row justify-around">
          <q-select class="col-12" filled label="Item Name" v-model="item.itemName" use-input hide-selected fill-input
            input-debounce="0" :options="item.itemNamefilterOptions" @new-value="itemCreateValue" @filter="itemNamefilterFn" required />
          <q-select class="col-12" filled label="Item Group" v-model="itemName" use-input hide-selected fill-input
            input-debounce="0" :options="itemNameOptions" @filter="itemNamefilterFn" />
          <q-select class="col-12" filled label="Building" v-model="itemName" use-input hide-selected fill-input
            input-debounce="0" :options="itemNameOptions" @filter="itemNamefilterFn" />
          <q-select class="col-12" filled label="Floor" v-model="itemName" use-input hide-selected fill-input
            input-debounce="0" :options="itemNameOptions" @filter="itemNamefilterFn" />
          <q-select class="col-12" filled label="Manufacturer" v-model="itemName" use-input hide-selected fill-input
            input-debounce="0" :options="itemNameOptions" @filter="itemNamefilterFn" />

          <q-input class="col-5" filled label="New Qty" v-model.number="model" type="number" />
          <q-input class="col-5" filled label="Used Qty" v-model.number="model" type="number" />
          <q-input class="col-5" filled label="Damaged Qty" v-model.number="model" type="number" />
          <q-input class="col-5" filled label="Missing Qty" v-model.number="model" type="number" />

          <q-input class="col-5" filled label="Depth" v-model="depth" hint="In Inches" />
          <q-input class="col-5" filled label="Width" v-model="width" hint="In Inches" />
          <q-input class="col-5" filled label="Diameter" v-model="diameter" />
          <q-input class="col-5" filled label="Height" v-model="height" hint="In Inches" />

          <q-select class="col-12" filled label="UOM" v-model="uom" use-input hide-selected fill-input
            input-debounce="0" :options="itemNameOptions" @filter="itemNamefilterFn" />
          <q-input class="col-12" filled label="Descrpition" v-model="text" autogrow />

        </div>
      </div>

      <q-page-sticky expand position="bottom">
        <div class="q-pa-sm row justify-center bg-white" style="width: 100%;">
          <q-btn class="bg-primary text-white col-11" label="Update"></q-btn>
        </div>
      </q-page-sticky>

    </q-page-container>
  </q-layout>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { apiClient } from 'src/boot/axios';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const image = ref(null)

const captureImage = async () => {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl, // Base64 image
      source: CameraSource.Camera, // Use Camera (or use `Photos` for gallery)
      quality: 90 // Image quality
    })

    image.value = photo.dataUrl // Display image in <q-img>
  } catch (error) {
    console.error('Camera error:', error)
  }
}

const item = reactive({
  itemNameOptions: ref([]),
  itemNamefilterOptions: ref([]),
  itemName: ref(null)
})

const get_item_list = async () => {
  const response = await apiClient.get('/api/resource/Item?limit_start=1&limit_page_length=1000')
  item.itemNameOptions = response.data.data.map(row => row.name)
  item.itemNamefilterOptions = item.itemNameOptions
  console.log(item)
}
get_item_list()
function itemCreateValue(val, done) {
  if (val.length > 0) {
    const modelValue = item.itemName
    val
      .split(/[,;|]+/)
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .forEach(v => {
        if (!item.itemNameOptions.includes(v)) {
          item.itemNameOptions.push(v)
        }
        if (!modelValue.includes(v)) {
          modelValue.push(v)
        }
      })

    done(null)
    item.itemName = modelValue
  }
}
function itemNamefilterFn(val, update) {
  update(() => {
    if (val === '') {
      item.itemNamefilterOptions = item.itemNameOptions
    }
    else {
      const needle = val.toLowerCase()
      item.itemNamefilterOptions = item.itemNameOptions.filter(
        v => v.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

// onMounted(get_item_list)
</script>
<style lang="css">
.col-4 {
  width: 100%;
}
</style>
