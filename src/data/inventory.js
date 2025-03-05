import { markRaw } from "vue"
import { apiClient } from 'src/boot/axios';

// const weekData = response.data.message

async function get_building(){
  const params = {
    "limit": 5
  }
  const response = await apiClient.get('/api/method/turbotracker.api.get_warehouse_info', { params })
  let quicklinks = []
  console.log(response, "response")
  const data = response.data.message
  for(let i=0; i<data.length; i++){
    let t = {
      icon: "warehouse",
      title: data[i].title,
      value: data[i].value,
      route: "InventoryLogBuildingListView",
    }
    quicklinks.push(t)
  }
  quicklinks = JSON.parse(JSON.stringify(quicklinks))
  return quicklinks
}

async function dashInfo() {
  const response = await apiClient.get('/api/method/turbotracker.mobile_integ.inventory.dash_info')
  let dashInfoList = []
  dashInfoList = response.data.message
  return dashInfoList
}

export const buildingList = await get_building()
export const dashInfoList = await dashInfo()
