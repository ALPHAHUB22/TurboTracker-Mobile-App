<template>
  <q-layout view="lHh Lpr lFf" style="background-color: #d1eff9;">
    <q-page-container>
      <!-- <q-header style="background-color: #d1eff9;"> -->
        <q-toolbar>
          <q-toolbar-title style="color: black">
            {{ filterName ? filterName : 'Inventory'}}
          </q-toolbar-title>
          <div class="q-gutter-sm">
            <q-btn round style="color: white; background-color: rgb(66, 194, 255)" icon="add" size="14px" :to="{ name: 'InventoryLogForm' }" />
          </div>
        </q-toolbar>
      <!-- </q-header> -->
      <div class="q-mx-md q-mt-xs search flex">
        <div class="input-wrapper" style="width: 100%; height: 5.7vh;">
          <q-icon class="q-pl-sm" name="search" size="sm" />
          <input type="text" placeholder="Search" v-model="searchText" />
          <q-icon v-if="searchText" size="sm" name="close" @click="searchText = ''" />
          <q-btn style="align-self: center;height: 5.5vh;border: 1px solid #42C2FF;" :style="isFilterApplied ? {color: 'white', backgroundColor: 'rgb(66, 194, 255)'} : {color: 'rgb(66, 194, 255)'}" dense class="filter-btn" icon="bi-filter" @click="togglefilter()">
          </q-btn>
        </div>
      </div>
      <ListCards :filters="filterConditions" />
      <q-dialog v-model="visible" :position="'top'"  @hide="onDialogClose">
        <q-card>
          <div class="q-pa-md q-gutter-sm">
            <q-select dense filled label="Select Items" clearable v-model="items" use-input use-chips multiple
              input-debounce="0" @new-value="itemCreateValue" :options="itemfilterOptions" @filter="itemFilterFn" />
            <q-select dense filled label="Select Building" v-model="building" use-input input-debounce="0"
              @new-value="buildingCreateValue" clearable :options="buildingfilterOptions" @filter="buildingFilterFn" />
            <q-checkbox v-model="isArchive" label="Show Archive" />
            <div class="q-gutter-xs float-right">
              <q-btn dense style="color: white; background-color: rgb(66, 194, 255)" @click="recordFilter()" icon="bi-filter" label="Filter" />
              <q-btn dense style="color: white; background-color: rgb(66, 194, 255)" @click="clearFilter()" icon="close" />
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
import { ref, reactive, watch, computed } from 'vue'
import ListFilter from 'src/components/inventoryList/ListFilter.vue';
import Footer from 'components/Footer.vue'
import ListCards from 'src/components/inventoryList/ListCards.vue';
import { apiClient } from 'src/boot/axios';
import { apiRequest } from 'src/boot/http.js';

const visible = ref(false)
const props = defineProps({
	filter: {
		type: String
	},
})
function togglefilter() {
  visible.value = !visible.value
}
const searchText = ref(null)
const itemOptions = ref([])
const itemfilterOptions = ref([])
const items = ref([])
const get_item_list = async () => {
  const response = await apiRequest.get('/api/resource/Item?limit_start=0&limit_page_length=1000')
  itemOptions.value = response.data.map(row => row.name)
  itemfilterOptions.value = itemOptions.value
}
get_item_list()
const isFilterApplied = ref(false)
const buildingOptions = ref([])
const buildingfilterOptions = ref([])
const building = ref(props.filter?props.filter: null)
const filterName = computed(() => building.value);
const isArchive = ref(false)

const get_building_list = async () => {
  const response = await apiRequest.get('/api/resource/Warehouse?filters=[["custom_is_building", "=", 1]]&limit_start=0&limit_page_length=1000')
  buildingOptions.value = response.data.map(row => row.name)
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

const filterConditions = reactive({
  "filter": ref(null),
  "searchText": ref(null)
})

function recordFilter() {
  let conditions = {}
  if (items.value.length > 0 || building.value || isArchive.value){
    isFilterApplied.value = true
  }
  else{
    isFilterApplied.value = false
  }
  if (items.value.length > 0) {
    conditions.item_code = items.value
  }
  if (building.value) {
    conditions.building = building.value
  }
  if (isArchive.value) {
    conditions.archived = isArchive.value
  }
  filterConditions.filter = conditions
  visible.value = false
}

const onDialogClose = () => {
  if (!isFilterApplied.value){
    items.value.length = []
    building.value = null
    isArchive.value = false
  }
  // You can run any function here, e.g., reset form, fetch data, etc.
};
const clearFilter = () => {
  filterConditions.filter = []
  isFilterApplied.value = false
  items.value = []
  building.value = null
  visible.value = false
}
if (props.filter){
  recordFilter()
}
watch(
  () => searchText.value,
  (value) => {
    filterConditions.searchText = value
  }
)

</script>
<style scoped>
.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #42C2FF;
  border-radius: 10px;
  background-color: white;
  /* padding: 8px; */
  gap: 8px;
}

.input-wrapper i {
  color: #42C2FF;
  border-radius: 10px;
}

.input-wrapper input {
  border: none;
  outline: none;
  flex: 1;
  border-radius: 10px;
}
</style>
