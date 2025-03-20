<template>
  <q-layout view="lHh Lpr lFf" class="form-layout">
    <!-- <q-header style="background-color: white;color:black" class="no-shadow" elevated> -->
      <q-toolbar style="position: fixed; z-index: 1;background-color: rgb(239, 251, 255);color:black">
        <q-btn flat dense icon="keyboard_arrow_left" aria-label="Menu" @click="$router.go(-1)" />
        <q-toolbar-title class="text-subtitle1">
          {{ inventoryLogId ? inventoryLogId : 'New'}}
        </q-toolbar-title>
        <div :class="isOnline ? 'online' : 'offline'" ></div>
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
            <!-- <q-select dense class="col-12" filled label="UOM" v-model="uom.selected" use-input hide-selected fill-input
              input-debounce="0" :options="uom.filterOptions" @new-value="(val, done) => createValue(uom, val, done)"
              @filter="(val, update) => filterFn(uom, val, update)" clearable :readonly="isReadonly"
              :rules="[ val => val && val.length > 0 || 'Please choose the UOM']"/> -->
            <q-input dense class="col-12" filled label="Descrpition" v-model="description" autogrow/>
            <FileUploader v-model:attachments="attachments" :id="props.inventoryLogId" />
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
import { ref, reactive, onMounted, watch, computed, inject } from 'vue'
import { apiClient } from 'src/boot/axios';
import { apiRequest } from 'src/boot/http.js';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import FileUploader from 'src/components/inventoryForm/FileUploader.vue'
import ArchiveDialog from 'src/components/inventoryForm/ArchiveDialog.vue'
import { isOnline } from 'src/boot/network';
import { fetchOnlineData, getOnlineInventoryInfo, getOnlineInventoryData, inventoryOnlineUpdate, inventoryOnlineSubmit, updateArchiveOnline } from 'src/data/inventory.js'
import { Preferences } from '@capacitor/preferences';

const props = defineProps({
	inventoryLogId: {
		type: String,
		default: null,
	},
})

const storageServ = inject('storageServ');
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
const floor = createReactiveEntity();
const manufacturer = createReactiveEntity();
// const uom = reactive({
//     options: ref([]),
//     filterOptions: ref([]),
//     selected: ref("Nos")
//   });
const newQty = ref(0)
const usedQty = ref(0)
const damagedQty = ref(0)
const incompleteQty = ref(0)
const depth = ref(null)
const width = ref(null)
const diameter = ref(null)
const height = ref(null)
const description = ref(null)
const attachments = ref([])
const formData = reactive({
    item_code : item.selected,
    // item_group : itemGroup.selected,
    building : building.selected,
    floor : floor.selected,
    manufacturer : manufacturer.selected,
    // uom : uom.selected,
    new_qty : newQty,
    qty : usedQty,
    damaged_qty : damagedQty,
    incomplete_qty : incompleteQty,
    depth : depth,
    width : width,
    diameter : diameter,
    height : height,
    description : description,
    attachments: attachments
})
const isArchive = ref(false)
const isArchiveDialog = ref(false)
async function onSubmit(){
  try {
    await Preferences.set({
      key: 'building',
      value: formData.building
    });
    await Preferences.set({
      key: 'floor',
      value:  formData.floor
    });
    if (isOnline.value){
      await inventoryOnlineSubmit(formData)
    }
    else{
      await storageServ.inventoryOfflineSubmit(formData)
    }
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
    if (isOnline.value){
      await inventoryOnlineUpdate(formData)
    }
    else{
      await storageServ.inventoryOfflineUpdate(formData)
    }
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
  // uom: get_apiEndpoint('UOM')
});

async function getFilterOptions(){
  if(isOnline.value){
    item.options = item.filterOptions = [...await fetchOnlineData(apiEndpoints.item)]
    building.options = building.filterOptions = [...await fetchOnlineData(apiEndpoints.building)]
    floor.options = floor.filterOptions = [...await fetchOnlineData(apiEndpoints.floor)]
    manufacturer.options = manufacturer.filterOptions = [...await fetchOnlineData(apiEndpoints.manufacturer)]
  }
  else{
    item.options = item.filterOptions = [...await storageServ.fetchOfflineData("inventory", "item_code")]
    building.options = building.filterOptions = [...await storageServ.fetchOfflineData("building")]
    floor.options = floor.filterOptions = [...await storageServ.fetchOfflineData("floor")]
    manufacturer.options = manufacturer.filterOptions = [...await storageServ.fetchOfflineData("manufacturer")]
  }
}


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
      await getInventoryData(value, formData.floor)
    }
    else if(inventoryLogId.value){
      inventoryLogId.value = null
      resetFormData(formData)
    }
	}
)

watch(
	() => building.selected,
	async(value) => {
    if (!props.inventoryLogId && floor.selected){
      floor.selected = ""
    }
    let pfilter = [...apiFilters.floor]
    if (value) pfilter.push(["parent_warehouse", "=", value])
    apiEndpoints.floor = get_apiEndpoint("Warehouse", pfilter)
    if (isOnline.value) floor.options = floor.filterOptions = [...await fetchOnlineData(apiEndpoints.floor)]
    else floor.options = floor.filterOptions = [...await storageServ.fetchOfflineData("floor")]
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

// watch(
// 	() => uom.selected,
// 	(value) => {
//     formData.uom = value
// 	}
// )

async function getInventoryLog(){
  if (props.inventoryLogId){
    const params = {
      "log_id": props.inventoryLogId
    }
    let response
    if(isOnline.value){
      response = await getOnlineInventoryInfo(params)
      response = response.message
    }
    else{
      response = await storageServ.getOfflineInventoryInfo(props.inventoryLogId)
    }
    isArchive.value = response.archived
    attachments.value = response.attachments
    updateFormData(response)
  }
}

async function getInventoryData(item_code, floor){
    const params = {
      "item_code": item_code,
      "floor": floor
    }
    let response
    if(isOnline.value){
      response = await getOnlineInventoryData(params)
      response = response?.message ? response?.message : response
    }
    else{
      response = await storageServ.getOfflineInventoryData(params)
    }
    if (Object.keys(response).length > 0) updateFormData(response)
    inventoryLogId.value = response.name
}

function updateFormData(data){
  if (data){
    item.selected = data.item_code
    // itemGroup.selected = data.item_group
    building.selected = data.building
    floor.selected = data.floor
    manufacturer.selected = data.manufacturer
    // uom.selected = data.uom
    newQty.value = data.new_qty
    usedQty.value = data.qty
    damagedQty.value = data.damaged_qty
    incompleteQty.value = data.incomplete_qty
    depth.value = data.depth
    width.value = data.width
    diameter.value = data.diameter
    height.value = data.height
    description.value = data.description
  }
}

function resetFormData(data){
  if (data){
    manufacturer.selected = ""
    // uom.selected = ""
    newQty.value = 0
    usedQty.value = 0
    damagedQty.value = 0
    incompleteQty.value = 0
    depth.value = ""
    width.value = ""
    diameter.value = ""
    height.value = ""
    description.value = ""
  }
}

const itemfilterFn = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    item.filterOptions = item.options.filter(v => v.toLowerCase().includes(needle))
  })
}

async function unArchiveLog(){
  try {
    const params = {
      "name": inventoryLogId.value,
      "archive_status": false
    }
    let response
    if (isOnline.value){
      response = await updateArchiveOnline(params)
    }
    else{
      response = await storageServ.updateArchiveOffline(params)
    }
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

watch(
  () => isOnline.value,
  async(value) => {
    if(!value){
      const memBuilding = await Preferences.get({ key: 'building' })
      building.selected = memBuilding.value
    }
    getFilterOptions()
  }
)

onMounted(async() =>{
  const memBuilding = await Preferences.get({ key: 'building' })
  building.selected = memBuilding.value
  const memFloor = await Preferences.get({ key: 'floor' })
  floor.selected = memFloor.value
  getFilterOptions()
  getInventoryLog()
})

</script>
<style lang="css">
.col-4 {
  width: 100%;
}
.q-select{
  /* background-color: white; */
}
</style>
