// import { useDb } from 'src/composables/useDb';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Preferences } from '@capacitor/preferences';
import { apiRequest } from 'src/boot/http.js';
import { deleteImagesInFolder } from 'src/utils/filesystem.js'

const dbName = await Preferences.get({ key: 'dbName' })

// const db = useDb();
const sqlite = new SQLiteConnection(CapacitorSQLite);

export async function prepareToOffline(db, storageServ, building){
  await loadBuildings(db, storageServ, building)
  await loadFloors(db, storageServ, building)
  await loadManufacturer(db, storageServ)
  await loadInventoryList(db, storageServ, building)
  await resetAttachments(db)
  await deleteImagesInFolder()
}

async function loadBuildings(db, storageServ, building){
  const buildingQuery = `insert into building (name) VALUES ('${building}');`
  await storageServ.clearTable("building")
  await db.run(buildingQuery)
  await sqlite.saveToStore(dbName.value);
}

async function loadFloors(db, storageServ, building){
  const params = {
    "building": building
  }
  const response = await apiRequest.get('/api/method/turbotracker.mobile_integ.resource.get_floors', params)
  const data = response.message
  const valuesString = data.map(floor => `('${floor}')`).join(", ");
  const floorQuery = `insert into floor (name) VALUES ${valuesString};`
  await storageServ.clearTable("floor")
  await db.run(floorQuery)
  await sqlite.saveToStore(dbName.value);
}

async function loadManufacturer(db, storageServ){
  const response = await apiRequest.get('/api/method/turbotracker.mobile_integ.resource.get_manufacturers')
  const data = response?.message
  const valuesString = data.map(manufacturer => `('${manufacturer}')`).join(", ");
  const manufacturerQuery = `INSERT INTO manufacturer (name) VALUES ${valuesString};`
  await storageServ.clearTable("manufacturer")
  await db.run(manufacturerQuery)
  await sqlite.saveToStore(dbName.value);
}

async function loadInventoryList(db, storageServ, building){
  const params = {
    "building": building
  }
  const response = await apiRequest.get('/api/method/turbotracker.mobile_integ.resource.get_inventory_list', params)
  const data = response?.message
  console.log(data)
  if (data && data.length > 0){
    const colList = Object.keys(data[0]).slice(0).join(",");
    console.log(data[0])
    // Build value placeholders for each user (e.g., `(?, ?, ?), (?, ?, ?), ...`)
    const placeholders = data
        .map(() => `(${Object.keys(data[0]).slice(0).map(() => "?").join(",")})`)
        .join(",");
    const values = data.flatMap(user => Object.values(user).slice(0));
    // console.log(placeholders)
    console.log(values)
    const inventoryQuery = `INSERT INTO inventory (${colList}) VALUES ${placeholders};`
    await storageServ.clearTable("inventory")
    const g = await db.run(inventoryQuery, values)
    console.log(g)
    await sqlite.saveToStore(dbName.value);
  }
}

async function resetAttachments(db){
  await db.run("DELETE FROM attachments;");
  await sqlite.saveToStore(dbName.value);
}

export async function clearLocal(storageServ){
  await deleteImagesInFolder()
  await storageServ.clearTable("building")
  await storageServ.clearTable("floor")
  await storageServ.clearTable("manufacturer")
  await storageServ.clearTable("inventory")
  await storageServ.clearTable("attachments")
  await Preferences.set({key: 'localClearedStatus', value: true})
}