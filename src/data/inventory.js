import { apiClient } from 'src/boot/axios';


export async function getBuildings(){
  const params = {
    "limit": 5
  }
  const response = await apiClient.get('/api/method/turbotracker.api.get_warehouse_info', { params })
  let buildings = []
  const data = response.data.message
  for(let i=0; i<data.length; i++){
    let building = {
      title: data[i].title,
      value: data[i].value,
      route: "InventoryLogBuildingListView",
    }
    buildings.push(building)
  }
  return buildings
}

export async function getDashInfo() {
  const response = await apiClient.get('/api/method/turbotracker.mobile_integ.inventory.dash_info')
  let dashInfoList = []
  dashInfoList = response.data.message
  return dashInfoList
}
