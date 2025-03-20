import { apiClient } from 'src/boot/axios';
import { apiRequest } from 'src/boot/http.js';


export async function getOnlineDashBuildings(){
  const params = {
    "limit": 5
  }
  const response = await apiRequest.get('/api/method/turbotracker.api.get_warehouse_info', params )
  let buildings = []
  const data = response.message
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

export async function getOnlineDashInfo() {
  const response = await apiRequest.get('/api/method/turbotracker.mobile_integ.inventory.dash_info')
  let dashInfoList = []
  dashInfoList = response.message
  return dashInfoList
}

export async function getOnlineItems() {
  const response = await apiRequest.get('/api/resource/Item?limit_start=0&limit_page_length=1000')
  const itemOptions = response.data.map(row => row.name)
  return itemOptions
}

export async function getOnlineBuildings() {
  const response = await apiRequest.get('/api/resource/Warehouse?filters=[["custom_is_building", "=", 1]]&limit_start=0&limit_page_length=1000')
  const buildingOptions = response.data.map(row => row.name)
  return buildingOptions
}

export async function getOnlineInventoryList(params){
  const response = await apiRequest.get('/api/method/turbotracker.api.get', params)
  return response
}

export async function fetchOnlineData(endpoint) {
  const response = await apiRequest.get(endpoint);
  const entityOptions = response.data.map(row => row.name);
  return entityOptions
}

export async function getOnlineInventoryInfo(params){
  const response = await apiRequest.get('/api/method/turbotracker.mobile_integ.inventory.get_inventory_log', params)
  return response
}

export async function getOnlineInventoryData(params){
  const response = await apiRequest.get('/api/method/turbotracker.api.get_item_stock', params)
  return response
}

export async function inventoryOnlineSubmit(formData){
  await apiRequest.post('/api/method/turbotracker.mobile_integ.inventory.create_inventory_log', formData);
}

export async function inventoryOnlineUpdate(formData){
  await apiRequest.post('/api/method/turbotracker.mobile_integ.inventory.update_inventory_log', formData);
}

export async function updateArchiveOnline(params){
  await apiRequest.post('/api/method/turbotracker.mobile_integ.inventory.archive_log', params);
}

export async function uploadAttachmentOnline(logId, content, fileName){
  let attachedTo = {
    dt: "Inventory Log",
    dn: logId
  }
  let data = {
    content: content,
    filename: fileName,
  }
  if (logId) Object.assign(data, attachedTo);
  data = JSON.stringify(data)
  const response = await apiRequest.post('/api/method/turbotracker.api.upload_base64_file', data);
  return response.message
}

export async function deleteAttachmentOnline(attachmentId){
  await apiRequest.post('/api/method/turbotracker.mobile_integ.inventory.delete_attachment', { "name": attachmentId });
}

export async function syncToServer(params){
  const response = await apiRequest.post('/api/method/turbotracker.mobile_integ.inventory.sync_to_server', params);
  return response
}