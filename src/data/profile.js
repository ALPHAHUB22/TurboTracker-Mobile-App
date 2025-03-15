// import { useDb } from 'src/composables/useDb';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Preferences } from '@capacitor/preferences';
import { apiRequest } from 'src/boot/http.js';

const dbName = await Preferences.get({ key: 'dbName' })

// const db = useDb();
const sqlite = new SQLiteConnection(CapacitorSQLite);

export async function prepareToOffline(db, building){
  loadBuildings(db, building)
  loadFloors(db, building)
  loadInventoryList(db, building)
  await sqlite.saveToStore(dbName.value);
}

async function loadBuildings(db, building){
  const buildingQuery = `insert into building (name) VALUES ('${building}');`
  await db.run("DELETE FROM building;");
  await db.run(buildingQuery)
}

async function loadFloors(db, building){
  const params = {
    "building": building
  }
  const response = await apiRequest.get('/api/method/turbotracker.mobile_integ.resource.get_floors', params)
  const data = response.message
  const valuesString = data.map(floor => `('${floor}')`).join(", ");
  const floorQuery = `insert into floor (name) VALUES ${valuesString};`
  await db.run("DELETE FROM floor;");
  await db.run(floorQuery)
  await sqlite.saveToStore(dbName.value);
}

async function loadInventoryList(db, building){
  const params = {
    "building": building
  }
  const response = await apiRequest.get('/api/method/turbotracker.mobile_integ.resource.get_inventory_list', params)
  const data = response?.message
  if (data && data.length > 0){
    const colList = Object.keys(data[0]).slice(0).join(",");
    console.log(data[0])
    // Build value placeholders for each user (e.g., `(?, ?, ?), (?, ?, ?), ...`)
    const placeholders = data
        .map(() => `(${Object.keys(data[0]).slice(0).map(() => "?").join(",")})`)
        .join(",");
    const values = data.flatMap(user => Object.values(user).slice(0));
    const inventoryQuery = `INSERT INTO inventory (${colList}) VALUES ${placeholders};`
    await db.run("DELETE FROM inventory;");
    await db.run(inventoryQuery, values)
    // await sqlite.saveToStore(dbName.value);
  }
}