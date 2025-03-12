<template>
  <q-dialog v-model="props.visible" :position="'bottom'">
    <q-card style="width: 350px">
      <div class="q-pa-md row q-gutter-sm">
        <q-select class="col-4" style="width: 47%" filled label="Select Items" clearable v-model="items" use-input
          use-chips multiple input-debounce="0" @new-value="itemCreateValue" :options="itemfilterOptions"
          @filter="itemFilterFn" />
        <q-select class="col-4" style="width: 47%" filled label="Select Building" v-model="building" use-input use-chips
          input-debounce="0" @new-value="buildingCreateValue" :options="buildingfilterOptions"
          @filter="buildingFilterFn" />
        <q-checkbox v-model="isArchive" label="Show Archive" />
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
})
const itemOptions = ref([])
const itemfilterOptions = ref(itemOptions.value)
const items = ref(null)
const buildingOptions = ref([])
const buildingfilterOptions = ref(buildingOptions.value)
const building = ref(null)
const isArchive = ref(false)

function itemCreateValue(val, done) {
  if (val.length > 0) {
    const modelValue = (items.value || []).slice()

    val
      .split(/[,;|]+/)
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .forEach(v => {
        if (itemOptions.value.includes(v) === false) {
          itemOptions.value.push(v)
        }
        if (modelValue.includes(v) === false) {
          modelValue.push(v)
        }
      })

    done(null)
    items.value = modelValue
  }
}

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
function itemFilterFn(val, update) {
  update(() => {
    if (val === '') {
      itemfilterOptions.value = itemOptions.value
    }
    else {
      const needle = val.toLowerCase()
      itemfilterOptions.value = itemOptions.value.filter(
        v => v.toLowerCase().indexOf(needle) > -1
      )
    }
  })
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
