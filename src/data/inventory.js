import { markRaw } from "vue"
import { apiClient } from 'src/boot/axios';

// const weekData = response.data.message
export const buildingList = get_building()

async function get_building(){
  const params = {
    "limit": 5
  }
  const response = await apiClient.get('/api/method/turbotracker.api.get_warehouse_info', { params })
  let quicklinks = []
  console.log(response)
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
// export const buildingList = createResource({
// 	url: "turbotracker.api.get_warehouse_info",
// 	params: {
// 		limit: 5,
// 	},
// 	auto: true,
// 	transform(data) {
// 		let quickLinks = []
// 		for(let i=0; i<data.length; i++){
// 			let t = {
// 				// icon: markRaw(LeaveIcon),
// 				title: data[i].title,
// 				value: data[i].value,
// 				route: "InventoryLogBuildingListView",
// 			}
// 			quickLinks.push(t)
// 		}
// 		quickLinks = JSON.parse(JSON.stringify(quickLinks))
// 		return quickLinks
// 	}
// })
