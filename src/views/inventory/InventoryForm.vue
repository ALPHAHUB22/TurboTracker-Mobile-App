<template>
  <q-layout view="lHh Lpr lFf">
    <!-- <q-header style="background-color: white;color:black" class="no-shadow" elevated> -->
      <q-toolbar style="position: fixed; z-index: 1;background-color: rgb(239, 251, 255);color:black">
        <q-btn flat dense icon="keyboard_arrow_left" aria-label="Menu" @click="$router.go(-1)" />
        <q-toolbar-title class="text-subtitle1">
          {{ inventoryLogId ? inventoryLogId : 'New'}}
        </q-toolbar-title>
        <q-btn flat icon="more_vert">
          <q-menu transition-show="flip-right" transition-hide="flip-left" :offset="[0, 5]">
            <q-list>
              <q-item v-if="!isArchive" v-ripple clickable @click="() => { isArchiveDialog = true }">
                <q-item-section >Archive</q-item-section>
              </q-item>
              <q-item v-else v-ripple clickable @click="unArchiveLog">
                <q-item-section >Unarchive</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    <!-- </q-header> -->
    <q-page-container style="padding-top: 40px;">
      <q-form :ref="myForm" @submit="handleSubmit" >
        <div class="q-pa-md q-mb-xl">
          <div class="q-mb-md row justify-around">
            <q-select dense class="col-12" filled label="Item Name" :model-value="item.selected" use-input hide-selected
              fill-input input-debounce="0" :options="item.filterOptions" @filter="itemfilterFn"
              @input-value="(val) => item.selected = val" :readonly="isReadonly"
              :rules="[ val => val && val.length > 0 || 'Please fill the Item Name']"/>
            <!-- <q-select dense class="col-12" filled label="Item Group" v-model="itemGroup.selected" use-input hide-selected
              fill-input input-debounce="0" :options="itemGroup.filterOptions"
              @new-value="(val, done) => createValue(itemGroup, val, done)"
              @filter="(val, update) => filterFn(itemGroup, val, update)" clearable :readonly="isReadonly"
              :rules="[ val => val && val.length > 0 || 'Please choose the Item Group']"/> -->
            <q-select dense class="col-12" filled label="Building" v-model="building.selected" use-input hide-selected
              fill-input input-debounce="0" :options="building.filterOptions"
              @new-value="(val, done) => createValue(building, val, done)"
              @filter="(val, update) => filterFn(building, val, update)" clearable :readonly="isReadonly"
              :rules="[ val => val && val.length > 0 || 'Please choose the Building']"/>
            <q-select dense class="col-12" filled label="Floor" v-model="floor.selected" use-input hide-selected fill-input
              input-debounce="0" :options="floor.filterOptions"
              @new-value="(val, done) => createValue(floor, val, done)"
              @filter="(val, update) => filterFn(floor, val, update)" clearable :readonly="isReadonly"
              :rules="[ val => val && val.length > 0 || 'Please choose the Floor']"/>
            <q-select dense class="col-12" filled label="Manufacturer" v-model="manufacturer.selected" use-input hide-selected
              fill-input input-debounce="0" :options="manufacturer.filterOptions"
              @new-value="(val, done) => createValue(manufacturer, val, done)"
              @filter="(val, update) => filterFn(manufacturer, val, update)" clearable :readonly="isReadonly"
              :rules="[ val => val && val.length > 0 || 'Please choose the Manufacturer']"/>

            <q-input dense class="col-5 q-mb-md" filled label="New Qty" v-model.number="newQty" type="number"
              @update:model-value="(val) => newQty = Math.round(val)"/>
            <q-input dense class="col-5 q-mb-md" filled label="Used Qty" v-model.number="usedQty" type="number"
              @update:model-value="(val) => usedQty = Math.round(val)"/>
            <q-input dense class="col-5 q-mb-md" filled label="Damaged Qty" v-model.number="damagedQty" type="number"
              @update:model-value="(val) => damagedQty = Math.round(val)"/>
            <q-input dense class="col-5 q-mb-md" filled label="Missing Qty" v-model.number="incompleteQty" type="number"
              @update:model-value="(val) => incompleteQty = Math.round(val)"/>

            <q-input dense class="col-5" filled label="Depth" v-model="depth" hint="In Inches"/>
            <q-input dense class="col-5" filled label="Width" v-model="width" hint="In Inches"/>
            <q-input dense class="col-5" filled label="Diameter" v-model="diameter" hint="In Inches"/>
            <q-input dense class="col-5" filled label="Height" v-model="height" hint="In Inches"/>
            <q-select dense class="col-12" filled label="UOM" v-model="uom.selected" use-input hide-selected fill-input
              input-debounce="0" :options="uom.filterOptions" @new-value="(val, done) => createValue(uom, val, done)"
              @filter="(val, update) => filterFn(uom, val, update)" clearable :readonly="isReadonly"
              :rules="[ val => val && val.length > 0 || 'Please choose the UOM']"/>
            <q-input dense class="col-12" filled label="Descrpition" v-model="descrption" autogrow/>
            <FileUploader v-model:attachments="attachments" />
            <ArchiveDialog v-if="isArchiveDialog" v-model:isArchiveDialog="isArchiveDialog" v-model:isArchive="isArchive" :id="props.inventoryLogId"/>
          </div>

        </div>

        <q-page-sticky expand position="bottom">
          <div class="q-pa-sm row justify-center" style="width: 100%;background-color: rgb(224, 245, 253)">
            <q-btn class="col-11 text-bold" style="background-color: #42C2FF;color: white;" type="submit" :label="inventoryLogId ? 'Update' : 'Submit'"></q-btn>
          </div>
        </q-page-sticky>
      </q-form>
    </q-page-container>
  </q-layout>
</template>
<script setup>
import { ref, reactive, onMounted, watch, computed, nextTick } from 'vue'
import { apiClient } from 'src/boot/axios';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import FileUploader from 'components/inventory/FileUploader.vue'
import ArchiveDialog from 'components/inventory/ArchiveDialog.vue'

const props = defineProps({
	inventoryLogId: {
		type: String,
		default: null,
	},
})

const inventoryLogId = ref(props.inventoryLogId)

const isReadonly = computed(() => !!props.inventoryLogId);
const handleSubmit = () => {
  if (inventoryLogId.value) {
    onUpdate();
  } else {
    onSubmit();
  }
};
const router = useRouter();
function createReactiveEntity() {
  return reactive({
    options: ref([]),
    filterOptions: ref([]),
    selected: ref(null),
  });
}
const myForm = ref(null)
const item = createReactiveEntity();
// const itemGroup = createReactiveEntity();
const building = createReactiveEntity();
building.selected = localStorage.getItem("building")
const floor = createReactiveEntity();
floor.selected = localStorage.getItem("floor")
const manufacturer = createReactiveEntity();
const uom = reactive({
    options: ref([]),
    filterOptions: ref([]),
    selected: ref("Nos")
  });
const newQty = ref(0)
const usedQty = ref(0)
const damagedQty = ref(0)
const incompleteQty = ref(0)
const depth = ref(null)
const width = ref(null)
const diameter = ref(null)
const height = ref(null)
const descrption = ref(null)
const attachments = ref([])
const formData = reactive({
    item_code : item.selected,
    // item_group : itemGroup.selected,
    building : building.selected,
    floor : floor.selected,
    manufacturer : manufacturer.selected,
    uom : uom.selected,
    new_qty : newQty,
    qty : usedQty,
    damaged_qty : damagedQty,
    incomplete_qty : incompleteQty,
    depth : depth,
    width : width,
    diameter : diameter,
    height : height,
    descrption : descrption,
    attachments: attachments
})
const isArchive = ref(false)
const isArchiveDialog = ref(false)
async function onSubmit(){
  try {
    localStorage.setItem("building", formData.building)
    localStorage.setItem("floor", formData.floor)
    const response = await apiClient.post('/api/method/turbotracker.mobile_integ.inventory.create_inventory_log', formData);
    Notify.create({
      color: 'green-5',
      textColor: 'white',
      icon: 'cloud_done',
      message: `Successfully Created the Inventory Log`
    })
    router.push({"name": "InventoryLogList"})
  }
  catch(error){
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: `API Error:' ${error.response?.data?.exception || error.message}`
    })
  }
}

async function onUpdate(){
  try {
    formData.name = inventoryLogId.value
    const response = await apiClient.post('/api/method/turbotracker.mobile_integ.inventory.update_inventory_log', formData);
    Notify.create({
      color: 'green-5',
      textColor: 'white',
      icon: 'cloud_done',
      message: `Inventory Log ${inventoryLogId.value} has successfully updated`
    })
    router.push({"name": "InventoryLogList"})
  }
  catch(error){
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: `API Error:' ${error.response?.data?.exception || error.message}`
    })
  }
}

async function fetchData(endpoint, entity) {
  const response = await apiClient.get(endpoint);
  entity.options = response.data.data.map(row => row.name);
  entity.filterOptions = entity.options;
}

const get_apiEndpoint = (doctype, filter=[]) => {
    let filter_str = ""
    if (filter.length > 0){
      filter_str = `&filters=${JSON.stringify(filter)}`
    }
    return `/api/resource/${doctype}?limit_page_length=1000${filter_str}`
}

const apiFilters = reactive({
  warehouse: [["custom_is_building", "=", 1]],
  floor: [["custom_is_floor", "=", 1]]
})

const apiEndpoints = reactive({
  item: get_apiEndpoint("Item"),
  // itemGroup: get_apiEndpoint("Item Group"),
  building: get_apiEndpoint("Warehouse", apiFilters.warehouse),
  floor: get_apiEndpoint("Warehouse", apiFilters.floor),
  manufacturer: get_apiEndpoint("Manufacturer"),
  uom: get_apiEndpoint('UOM')
});


const get_item_list = (item_api) => fetchData(item_api, item);
// const get_item_groups = (item_group_api) => fetchData(item_group_api, itemGroup);
const get_buildings = (building_api) => fetchData(building_api, building);
const get_floors = (floor_api) => fetchData(floor_api, floor);
const get_manufacturers = (manufacturer_api) => fetchData(manufacturer_api, manufacturer);
const get_uoms = (uom_api) => fetchData(uom_api, uom);

function createFilterFn() {
  return (entity, val, update) => {
    update(() => {
      if (val === '') {
        entity.filterOptions = entity.options;
      } else {
        const needle = val.toLowerCase();
        entity.filterOptions = entity.options.filter(v => v.toLowerCase().includes(needle));
      }
    });
  };
}

function createValueHandler() {
  return (entity, val, done) => {
    if (val.length > 0) {
      const modelValue = entity.selected;
      val.split(/[,;|]+/)
        .map(v => v.trim())
        .filter(v => v.length > 0)
        .forEach(v => {
          if (!entity.options.includes(v)) {
            entity.options.push(v);
          }
          if (!modelValue.includes(v)) {
            modelValue.push(v);
          }
        });
      done(null);
      entity.selected = modelValue;
    }
  };
}

const createValue = createValueHandler();
const filterFn = createFilterFn();

watch(
	() => item.selected,
	async (value) => {
    formData.item_code = value
    if (value && formData.floor){
      await getInventoryData(formData.item_code, value)
    }
    else if(inventoryLogId.value){
      inventoryLogId.value = null
      resetFormData(formData)
    }
	}
)

watch(
	() => building.selected,
	(value) => {
    if (!props.inventoryLogId && floor.selected){
      floor.selected = ""
    }
    let pfilter = [...apiFilters.floor]
    if (value) pfilter.push(["parent_warehouse", "=", value])
    apiEndpoints.floor = get_apiEndpoint("Warehouse", pfilter)
		get_floors(apiEndpoints.floor)
    formData.building = value
	}
)

watch(
	() => floor.selected,
	async (value) => {
    formData.floor = value
    if (formData.item_code && value){
      await getInventoryData(formData.item_code, value)
    }
    else if(inventoryLogId.value){
      inventoryLogId.value = null
      resetFormData(formData)
    }
	}
)

watch(
	() => manufacturer.selected,
	(value) => {
    formData.manufacturer = value
	}
)

watch(
	() => uom.selected,
	(value) => {
    formData.uom = value
	}
)

async function getInventoryLog(){
  if (props.inventoryLogId){
    const params = {
      "log_id": props.inventoryLogId
    }
    const response = await apiClient.get('/api/method/turbotracker.mobile_integ.inventory.get_inventory_log', { params })
    const data = response.data.message
    isArchive.value = data.archived
    attachments.value = data.attachments
    updateFormData(data)
  }
}

async function getInventoryData(item_code, floor){
    const params = {
      "item_code": item_code,
      "floor": floor
    }
    const response = await apiClient.get('/api/method/turbotracker.api.get_item_stock', { params })
    const data = response.data.message
    updateFormData(data)
    inventoryLogId.value = data.name
}

function updateFormData(data){
  if (data){
    item.selected = data.item_code
    // itemGroup.selected = data.item_group
    building.selected = data.building
    floor.selected = data.floor
    manufacturer.selected = data.manufacturer
    uom.selected = data.uom
    newQty.value = data.new_qty
    usedQty.value = data.qty
    damagedQty.value = data.damaged_qty
    incompleteQty.value = data.incomplete_qty
    depth.value = data.depth
    width.value = data.width
    diameter.value = data.diameter
    height.value = data.height
    descrption.value = data.descrption
  }
}

function resetFormData(data){
  if (data){
    manufacturer.selected = ""
    uom.selected = ""
    newQty.value = 0
    usedQty.value = 0
    damagedQty.value = 0
    incompleteQty.value = 0
    depth.value = ""
    width.value = ""
    diameter.value = ""
    height.value = ""
    descrption.value = ""
  }
}

onMounted(
  get_item_list(apiEndpoints.item),
  // get_item_groups(apiEndpoints.itemGroup),
  get_buildings(apiEndpoints.building),
  get_floors(apiEndpoints.floor),
  get_manufacturers(apiEndpoints.manufacturer),
  get_uoms(apiEndpoints.uom),
  getInventoryLog()
)
const itemfilterFn = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    item.filterOptions = item.options.filter(v => v.toLowerCase().includes(needle))
  })
}

async function unArchiveLog(){
  try {
    const response = await apiClient.post('/api/method/turbotracker.mobile_integ.inventory.archive_log', {"name": inventoryLogId.value, "archive_status": false});
    Notify.create({
      color: 'green-5',
      textColor: 'white',
      icon: 'cloud_done',
      message: `Inventory Log ${inventoryLogId.value} has successfully unarchived`
    })
    isArchive.value = false
    router.push({"name": "InventoryLogList"})
  }
  catch(error){
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: `API Error:' ${error.response?.data?.exception || error.message}`
    })
  }
}

</script>
<style lang="css">
.col-4 {
  width: 100%;
}
.q-select{
  /* background-color: white; */
}
.q-layout{
  background: linear-gradient(to bottom, rgb(247, 251, 253) , rgb(239, 251, 255))
}
</style>
