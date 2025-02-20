<template>
  <div v-touch-swipe.mouse.right="handleSwipe" v-touch-swipe.mouse.left="handleSwipe" class="q-pa-md">
    <div class="row justify-center">
      <q-pagination class="shadow-20 q-pa-sm rounded-borders fixed" style="z-index: 1; background-color: white;"
        v-if="rows.length > 0" v-model="pagination.page" color="primary" :max="pagination.totalPageNumber" size="md" :max-pages="4"
        direction-links >
      </q-pagination>
    </div>
    <q-pull-to-refresh @refresh="refresh">
    <div class="q-mt-xl">
      <q-table :rows="rows" :columns="columns" row-key="name" selection="multiple" v-model:selected="selected" :filter="filter" grid
        hide-header v-model:pagination="pagination" no-data-label="I didn't find anything for you" hide-pagination hide-selected-banner>
        <template v-slot:top>
          <div class="row justify-between col">
            <q-checkbox size="30px" dense v-if="rows.length > 0" v-model="allSelected" label="Select All" />
            <div class="text-caption text-weight-bold" v-if="selected.length">{{ selected.length }} {{ selected.length > 1
              ? 'records' :'record'}} selected</div>
            <div class="text-subtitle2" v-if="rows.length > 0" style="font-size: 12px">{{ currentPagination(pagination.page, pagination.rowsPerPage) }} of {{ totalRecords }}</div>
          </div>
        </template>
        <template v-slot:item="items">
          <!-- {{ items }} -->
          <transition name="slide">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
              :class="{ 'transition-left': transitionLeft, 'transition-right': transitionRight }"
            :style="items.selected ? 'transform: scale(0.95);' : ''">
            <q-card v-ripple class="shadow-20 q-pt-xs" style="border-radius: 2%;" @click="popDialog(items.row)"
              :class="items.selected ? 'bg-primary text-white' : 'bg-grey-1'">
              <div class="row justify-between">
              <q-checkbox class="col-10" size="25px" v-model="items.selected" :label="items.row.name"
                style="font-weight: bold;" />
                <q-btn flat dense class="col-2" :class="items.selected ? 'bg-primary text-white' : 'bg-grey-1'" :to="{'name': 'inventoryForm'}" icon="edit" color="primary" size="11px" />
              </div>
              <q-separator />
              <div class="row q-pt-xs">
                <div class="col-4 q-px-xs" style="padding-top: 2px;">
                  <q-img :src="items.row.image" class="q-ml-xs" style="border-radius: 10%;"
                    width="100%" height="100px" />
                </div>
                <div class="col-8">
                  <div class="q-pl-sm" :class="['custom-container', items.selected ? 'bg-primary' : 'bg-grey-1']" style="height: 100%;border-radius: 2%;">
                    <div v-for="col in items.cols.filter(col => col.name !== 'item')" :key="col.name" class="custom-item">
                      <div class="custom-label"><strong>{{ col.label }}:</strong></div>
                      <div class="custom-value">{{ col.value }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </transition>
        </template>
        <template v-slot:no-data="{ icon, message, filter }">
          <div class="q-mt-xl q-pt-xl full-width row flex-center text-primary q-gutter-sm text-subtitle1">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>
              {{ message }}
            </span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
      </q-table>
      <q-dialog v-model="isDialog" transition-show backdrop-filter="blur(4px) saturate(150%)">
        <q-card class="my-card">
          <q-img :src="dialogRow.image" :ratio="1" style="min-width:310px;" />

          <q-card-section>
            <q-btn fab color="primary" icon="edit" class="absolute"
             :to="{'name': 'InventoryForm'}"
              style="top: 0; right: 12px; transform: translateY(-50%);" />

            <div class="row no-wrap items-center">
              <div class="col text-h6 ellipsis">
                {{ dialogRow.item }}
              </div>
            </div>

          </q-card-section>

          <q-card-section class="q-pt-none">
            <div>
              <div class="text-subtitle1">
                {{ dialogRow.building }}
              </div>
              <div class="text-subtitle1">
                {{ dialogRow.floor }}
              </div>
            </div>
            <div class="text-caption text-grey">
              {{ dialogRow.manufacturer }}
            </div>
            <div class="text-caption text-grey">
              {{ dialogRow.manufacturer }}
            </div>
          </q-card-section>

          <q-separator />

          <!-- <q-card-actions align="right">
            <q-btn v-close-popup flat color="primary" label="Reserve" />
            <q-btn v-close-popup flat color="primary" round icon="event" />
          </q-card-actions> -->
        </q-card>
      </q-dialog>
    </div>
  </q-pull-to-refresh>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { apiClient } from 'src/boot/axios';

const len = ref("")
// const allSelected = ref(false)
const props = defineProps({
	filters: {
		type: Array,
		required: false,
		default: []
	},
})

function refresh(done) {
  setTimeout(async () => {
    await get_inventory_list()
    done()
  }, 1000)
}

const rows = ref([])
// const rows = ref([])
const filter = ref('')
const filters = ref([])
const selected = ref([])
const isDialog = ref(false)
const dialogRow = ref({})

const transitionLeft = ref(false)
const transitionRight = ref(false)

const rowsPerPage = 8
const totalRecords = ref(0)
var totalPageNumber = 0

const pagination = ref({
  page: 1,
  rowsPerPage: rowsPerPage,
  totalPageNumber: totalPageNumber,
  rowsNumber: rows.value.length
})


const get_inventory_list = async() => {
  const limit_start = (pagination.value.page-1) *pagination.value.rowsPerPage
  console.log(encodeURIComponent(JSON.stringify(filters.value)), "FILTERs")
  const response = await apiClient.get('/api/method/turbotracker.api.get',
    {
      params: {
        limit_start:limit_start,
        page_length:rowsPerPage,
        filters: encodeURIComponent(JSON.stringify(filters.value))
      }
    }
  )
  console.log(response.data.message)
  rows.value = response.data.message[0]
  totalRecords.value = response.data.message[1]
  pagination.value.totalPageNumber = Math.ceil(totalRecords.value / rowsPerPage);
};

// Watch for changes in pagination.page
watch(() => pagination.value.page, () => {
  get_inventory_list();
});


watch(() => props.filters, () => {
  console.log(props.filters, "FILTERS")
  filters.value = props.filters
  get_inventory_list();
}, {deep: true});

get_inventory_list()

const columns = [
  { name: 'item_code', align: 'center', label: 'Item Title', field: 'item_code', sortable: true },
  { name: 'manufacturer', align: 'center', label: 'Manufacturer', field: 'manufacturer', sortable: true },
  { name: 'building', align: 'center', label: 'Building', field: 'building', sortable: true },
  { name: 'floor', align: 'center', label: 'Floor', field: 'floor', sortable: true },
]


function handleSwipe ({ evt, ...newInfo }) {
  if(newInfo.direction === "left" && Math.ceil(totalRecords.value/pagination.value.rowsPerPage) !== pagination.value.page){
    pagination.value.page++
    transitionLeft.value = true
    setTimeout(() => transitionLeft.value = false, 700)
  }
  else if(newInfo.direction === "right" && pagination.value.page !== 1){
    pagination.value.page--
    transitionRight.value = true
    setTimeout(() => transitionRight.value = false, 700)
  }
}


const currentPagination = (page, rowsPerPage) => {
  const currPage = page * rowsPerPage
  const abs = totalRecords.value - currPage
  if (Math.sign(abs) === -1) {
    return totalRecords.value
  }
  return currPage
}

const allSelected = computed({
  get: () => selected.value.length === rows.value.length && rows.value.length > 0,
  set: (val) => {
    if (val) {
      selected.value = [...rows.value]; // Select all
    } else {
      selected.value = []; // Deselect all
    }
  }
});

function popDialog(row) {
  dialogRow.value = row
  isDialog.value = true
}
</script>

<style lang="css">
div {
  font-size: 12px;
}
</style>
<style lang="sass">
.transition-left
  animation: slideInLeft 0.7s ease-in-out

@keyframes slideInLeft
  from
    opacity: 0
    transform: translateX(200px)
  to
    opacity: 1
    transform: translateX(0)

.transition-right
  animation: slideInRight 0.7s ease-in-out

@keyframes slideInRight
  from
    opacity: 0
    transform: translateX(-200px)
  to
    opacity: 1
    transform: translateX(0)
</style>
