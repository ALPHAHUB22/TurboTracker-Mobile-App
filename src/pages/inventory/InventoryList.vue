<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-header>
        <q-toolbar>
          <q-toolbar-title>
            TurboTracker
          </q-toolbar-title>
          <div class="q-gutter-sm">
            <q-btn color="white" size="11px" text-color="primary" icon="filter_alt" @click="togglefilter()" />
            <q-btn color="white" size="11px" :to="{ name: 'InventoryForm' }" text-color="primary">+ Add</q-btn>
          </div>
        </q-toolbar>
      </q-header>
      <!-- <q-btn-group flat>
      <q-btn  color="white" text-color="primary"  icon="filter_alt" />
      <q-btn  color="white" text-color="primary" icon="filter_alt_off" size="12px" style="width: 20%;"/>
    </q-btn-group> -->
      <!-- <q-pull-to-refresh @refresh="refresh"> -->
        <ListCards :filters="filteredRows"/>
        <q-dialog v-model="visible" :position="'top'">
          <q-card>
            <div class="q-pa-md q-gutter-sm">
              <q-select filled label="Select Items" clearable v-model="items" use-input use-chips multiple
                input-debounce="0" @new-value="itemCreateValue" :options="itemfilterOptions" @filter="itemFilterFn" />
              <q-select filled label="Select Building" v-model="building" use-input input-debounce="0"
                @new-value="buildingCreateValue" clearable :options="buildingfilterOptions"
                @filter="buildingFilterFn" />
              <q-checkbox v-model="isArchive" label="Show Archive" />
              <div class="q-gutter-xs float-right">
              <q-btn color="primary" @click="clearFilter()" icon="filter_alt_off" />
              <q-btn color="primary" @click="recordFilter()" icon="filter_alt" label="Filter" />
            </div>
            </div>
          </q-card>
        </q-dialog>
      <!-- </q-pull-to-refresh> -->
    </q-page-container>
    <Footer />
  </q-layout>
</template>
<script setup>
import { ref, watch } from 'vue'
import ListFilter from 'src/components/inventory/ListFilter.vue';
import Footer from 'components/Footer.vue'
import ListCards from 'src/components/inventory/ListCards.vue';
import { apiClient } from 'src/boot/axios';
const visible = ref(false)

function togglefilter() {
  visible.value = !visible.value
}

const itemOptions = ref([])
const itemfilterOptions = ref([])
const items = ref([])
const get_item_list = async() => {
  const response = await apiClient.get('/api/resource/Item?limit_start=1&limit_page_length=1000')
  itemOptions.value = response.data.data.map(row => row.name)
  itemfilterOptions.value = itemOptions.value
}
get_item_list()
const isFilterApplied = ref(false)
const buildingOptions = ref([])
const buildingfilterOptions = ref([])
const building = ref(null)
const isArchive = ref(false)

const get_building_list = async() => {
  const response = await apiClient.get('/api/resource/Warehouse?filters=[["custom_is_building", "=", 1]]&limit_start=0&limit_page_length=1000')
  buildingOptions.value = response.data.data.map(row => row.name)
  buildingfilterOptions.value = buildingOptions.value
}
get_building_list()

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

const filters = ref([])
const filteredRows = ref([])
// // const filteredRows = computed(() => {
// //   return rows.value.filter(row => row.item && row.building > 10);
// // });
// console.log(filteredRows.value)
function recordFilter() {
  isFilterApplied.value = true
  let filterConditions = []
  if (items.value.length > 0) {
    filterConditions.push(["item_code", ["in", items.value]])
    // filteredRows.value = rows.value.filter(row => items.value.includes(row.item));
  }
  if (building.value) {
    filterConditions.push(["building", building.value])
  }
  if(isArchive.value){
    filterConditions.push(["archived", isArchive.value])
  }
  filteredRows.value = filterConditions
  // console.log(filteredRows.value)
  // visible.value = false
}

const clearFilter = () => {
  filteredRows.value = []
  isFilterApplied.value = false
  items.value = []
  visible.value = false
}

</script>
