<template>
  <div v-touch-swipe.mouse.right="handleSwipe" v-touch-swipe.mouse.left="handleSwipe" class="q-mx-md">
    <q-pull-to-refresh @refresh="refresh">
      <div class="q-mb-xl">
        <q-table :rows="rows" :columns="columns" row-key="name" selection="multiple" v-model:selected="selected"
          :filter="filter" grid hide-header v-model:pagination="pagination"
          no-data-label="I didn't find anything for you" hide-pagination hide-selected-banner>
          <template v-slot:top>
            <div class="row justify-between col">
              <div class="text-subtitle2 text-grey-8 text-bold" v-if="rows.length > 0" style="font-size: 12px">{{
                currentPagination(pagination.page, pagination.rowsPerPage) }} of {{ totalRecords }}</div>
              <div class="text-caption text-weight-bold" v-if="selected.length">{{ selected.length }} {{ selected.length
                > 1
                ? 'records' : 'record' }} selected</div>
              <q-checkbox class="reverse-checkbox" size="30px" dense v-if="isSelection" v-model="allSelected"
                label="Select All" />
            </div>
          </template>
          <template v-slot:item="items">
            <!-- {{ items }} -->
            <transition name="slide">
              <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
                :class="{ 'transition-left': transitionLeft, 'transition-right': transitionRight }"
                :style="items.selected ? 'transform: scale(0.95);' : ''">
                <q-card v-ripple class="q-pt-xs" style="border-radius: 10px;" @click="selectAction(items)"
                  :style="items.selected ? { color: 'white', backgroundColor: 'rgb(66, 194, 255)' } : { color: 'black', backgroundColor: 'white' }"
                  v-touch-hold.mouse="() => handleHold(items)">
                  <div class="row q-py-xs">
                    <div class="col-2 q-px-xs" style="padding-bottom: 3px;">
                      <!-- {{ items }} -->
                      <q-img :src="items.row.image" class="q-ml-xs" style="border-radius: 10px;" width="100%"
                        height="50px" />
                    </div>
                    <div class="col-10" style="border-radius: 10px;"
                      :style="items.selected ? { color: 'white', backgroundColor: 'rgb(66, 194, 255)' } : { color: 'black', backgroundColor: 'white' }">
                      <div class="q-pl-sm" style="height: 100%;">
                        <div v-for="col in items.cols.filter(col => col.name !== 'item')" :key="col.name"
                          class="custom-item">
                          <!-- <div class="custom-label"><strong>{{ col.label }}:</strong></div> -->
                          <div class="custom-value" style="font-size:11px"
                            :style="col.name === 'item_code' ? { fontSize: '12px', fontWeight: 'bold' } : { fontSize: '10px' }">
                            {{ col.value }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card>
              </div>
            </transition>
          </template>
          <template v-slot:no-data="{ icon, message, filter }">
            <div class="q-mt-xl q-pt-xl full-width row flex-center text-black q-gutter-sm text-subtitle1"
              style="margin-top: 24vh;">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span>
                {{ message }}
              </span>
              <q-icon size="2em" :name="props.filters ? 'filter_b_and_w' : icon" />
            </div>
          </template>
        </q-table>
        <q-dialog class="" v-model="isDialog" transition-show backdrop-filter="blur(4px) saturate(150%)" full-width>
          <q-card class="my-card" style="border-radius: 10px; background-color: rgb(224, 245, 253)">
            <!-- <q-img :src="dialogRow.image" style="min-width:310px;" /> -->
            <q-img :src="dialogRow.image" :ratio="1" />
            <q-card-section class="q-pa-none">
              <div class="row justify-end q-gutter-xs q-mr-md">
                <!-- <q-btn class="col-1 popbutton" size="12px" flat icon="bi-archive" /> -->
                <q-btn class="col-1 popbutton" size="12px" flat icon="bi-pencil-square"
                  :to="{ name: 'InventoryLogDetailView', params: { inventoryLogId: dialogRow.name } }" />
              </div>

            </q-card-section>

            <q-card-section class="q-pt-none">
              <div>
                <div class="text-subtitle2 text-grey-9">
                  {{ dialogRow.item_code }}
                </div>
                <div class="text-subtitle2 text-grey-9">
                  {{ dialogRow.building }}
                </div>
                <div class="text-subtitle2 text-grey-9">
                  {{ dialogRow.floor }}
                </div>
                <div class="text-subtitle2 text-grey-9">
                  {{ dialogRow.manufacturer }}
                </div>
              </div>
              <div class="text-caption row justify-around q-gutter-md">
                <div class="">
                  <div class="row justify-between q-gutter-x-xs">
                    <strong class="text-grey-9">Depth</strong>
                    <span class="text-grey-7">- {{ dialogRow.depth }} in</span>
                  </div>
                  <div class="row justify-between q-gutter-x-xs">
                    <strong class="text-grey-9">Diameter</strong>
                    <span class="text-grey-7">- {{ dialogRow.diameter }} in</span>
                  </div>
                  <div class="row justify-between q-gutter-x-xs">
                    <strong class="text-grey-9">Width</strong>
                    <span class="text-grey-7">- {{ dialogRow.width }} in</span>
                  </div>
                  <div class="row justify-between q-gutter-x-xs">
                    <strong class="text-grey-9">Height</strong>
                    <span class="text-grey-7">- {{ dialogRow.height }} in</span>
                  </div>
                </div>
                <div>
                  <div class="row justify-between q-gutter-x-xs">
                    <strong class="text-grey-9">New</strong>
                    <span class="text-grey-7">- {{ dialogRow.new_qty }}</span>
                  </div>
                  <div class="row justify-between q-gutter-x-xs">
                    <strong class="text-grey-9">Used</strong>
                    <span class="text-grey-7">- {{ dialogRow.qty }}</span>
                  </div>
                  <div class="row justify-between q-gutter-x-xs">
                    <strong class="text-grey-9">Damaged</strong>
                    <span class="text-grey-7">- {{ dialogRow.damaged_qty }}</span>
                  </div>
                  <div class="row justify-between q-gutter-x-xs">
                    <strong class="text-grey-9">Missing</strong>
                    <span class="text-grey-7">- {{ dialogRow.incomplete_qty }}</span>
                  </div>
                </div>
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
    <div class="row justify-center" style="position: relative">
      <q-pagination class="q-ma-sm q-pa-sm rounded-borders fixed"
        style="position: fixed; bottom: 60px; background-color: white; border: 1px solid #42C2FF;"
        v-if="rows.length > 0" v-model="pagination.page" :max="pagination.totalPageNumber" size="md" :max-pages="4"
        direction-links>
      </q-pagination>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { apiClient } from 'src/boot/axios';
import { apiRequest } from 'src/boot/http.js';

const len = ref("")
// const allSelected = ref(false)
const props = defineProps({
  filters: {
    type: Object,
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
const filters = ref(props.filters ? props.filters : [])
const selected = ref([])
const isDialog = ref(false)
const dialogRow = ref({})
const isSelection = ref(false)

const transitionLeft = ref(false)
const transitionRight = ref(false)

const rowsPerPage = 10
const totalRecords = ref(0)
var totalPageNumber = 0

const pagination = ref({
  page: 1,
  rowsPerPage: rowsPerPage,
  totalPageNumber: totalPageNumber,
  rowsNumber: rows.value.length
})


const get_inventory_list = async () => {
  const limit_start = (pagination.value.page - 1) * pagination.value.rowsPerPage
  const params = {
    limit_start: limit_start,
    page_length: rowsPerPage,
    filters: encodeURIComponent(JSON.stringify(filters.value))
  }
  const response = await apiRequest.get('/api/method/turbotracker.api.get', params)
  rows.value = response.message[0]
  totalRecords.value = response.message[1]
  pagination.value.totalPageNumber = Math.ceil(totalRecords.value / rowsPerPage);
};

// Watch for changes in pagination.page
watch(() => pagination.value.page, () => {
  get_inventory_list();
});

watch(() => props.filters, () => {
  filters.value = props.filters
  get_inventory_list();
}, { deep: true });

get_inventory_list()

const columns = [
  { name: 'item_code', align: 'center', label: 'Item Title', field: 'item_code', sortable: true },
  { name: 'building', align: 'center', label: 'Building', field: 'building', sortable: true },
  // { name: 'floor', align: 'center', label: 'Floor', field: 'floor', sortable: true },
]

function handleSwipe({ evt, ...newInfo }) {
  if (newInfo.direction === "left" && Math.ceil(totalRecords.value / pagination.value.rowsPerPage) !== pagination.value.page) {
    pagination.value.page++
    transitionLeft.value = true
    setTimeout(() => transitionLeft.value = false, 700)
  }
  else if (newInfo.direction === "right" && pagination.value.page !== 1) {
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
      isSelection.value = false
    }
  }
});

function handleHold(items) {
  isSelection.value = true
  items.selected = true
}

function selectAction(items) {
  if (isSelection.value) {
    items.selected = !items.selected
  }
  else if (!items.selected) {
    popDialog(items.row)
  }
  if (selected.value.length === 0) {
    isSelection.value = false
  }

}
function popDialog(row) {
  dialogRow.value = row
  isDialog.value = true
}
</script>

<style lang="css">
.filter-btn {
  border-radius: 10px;
  background-color: white;
}

.search-bar {
  background-color: white;
  border-radius: 10px;
}

.search {
  /* justify-content: space-between; */
  align-items: center;
  color: #42C2FF;
  display: flex;
  align-items: stretch;
  /* color: black; */
}

.popbutton {
  transform: translateY(-50%);
  background-color: rgb(224, 245, 253);
  color: #42C2FF
}

div.parent {
  position: relative;
}

div.fixed {
  position: fixed;
  bottom: 50px;
}

.reverse-checkbox .q-checkbox__label {
  order: -1;
  /* Moves the label before the checkbox */
  margin-right: 8px;
  margin-top: 1px;
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
