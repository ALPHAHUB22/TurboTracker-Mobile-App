import { BehaviorSubject } from "rxjs";
import { getCurrentInstance } from "vue";
import { Capacitor } from '@capacitor/core';
import { UserUpgradeStatements } from "src/upgrades/user.statements";
import { Preferences } from '@capacitor/preferences';
import { saveImage, loadImage, deleteImage } from 'src/utils/filesystem.js'
import { getTime } from 'src/utils/utils.js'

const dbName = await Preferences.get({ key: 'dbName' })
class StorageService {
  versionUpgrades = UserUpgradeStatements;
  loadToVersion =
    UserUpgradeStatements[UserUpgradeStatements.length - 1].toVersion;
  db; // SQLiteDBConnection or undefined
  database = dbName.value
  sqliteServ;
  dbVerServ;
  isInitCompleted = new BehaviorSubject(false);
  appInstance = getCurrentInstance();
  platform = Capacitor.getPlatform();;

  constructor(sqliteService, dbVersionService) {
    this.sqliteServ = sqliteService;
    this.dbVerServ = dbVersionService;
  }

  async getOfflineDashBuilding() {
    const buildingQuery = "SELECT name FROM building LIMIT 1";
    try {
        const building = await this.db.query(buildingQuery);
        if (building.values && building.values.length > 0) {
            return building.values[0].name;
        }
        return null; // No building found
    } catch (error) {
        console.error("Error fetching building:", error);
        return null; // Handle errors gracefully
    }
  }

  async getOfflineDashInfo(){
    const inventoryQuery = "SELECT count(*) as itemCount FROM inventory";
    const buildingQuery = "SELECT count(*) as buildingCount FROM building";
    const dashInfo = {
      "item": 0,
      "building": 0
    }
    try {
      const inventoryCount = await this.db.query(inventoryQuery);
      const buildingCount = await this.db.query(buildingQuery);
      if (inventoryCount?.values) dashInfo["item"] = inventoryCount?.values[0].itemCount
      if (buildingCount?.values) dashInfo["building"] = buildingCount?.values[0].buildingCount
    } catch (error) {
        console.error("Error fetching building:", error);
    }
    return dashInfo
  }

  async getOfflineBuildings() {
    const buildingQuery = "SELECT name FROM building";
    try {
        const building = await this.db.query(buildingQuery);
        if (building.values && building.values.length > 0) {
            return building.values.map(building => building.name);
        }
        return []; // No building found
    } catch (error) {
        console.error("Error fetching building:", error);
        return []; // Handle errors gracefully
    }
  }

  async getOfflineItems() {
    const itemQuery = "SELECT item_code FROM inventory";
    try {
        const item = await this.db.query(itemQuery);
        if (item.values && item.values.length > 0) {
          return item.values.map(inventory => inventory.item_code);
        }
        return []; // No item found
    } catch (error) {
        console.error("Error fetching item:", error);
        return []; // Handle errors gracefully
    }
  }

  async getOfflineInventoryList(params) {
    const limit = params.limit
    const page = params.page
    const filters = params.filters?.filter
    const searchText = params.filters?.searchText
    const offset = limit * (page - 1)
    let response = {
        "records": [],
        "total_count": 0,
        "page_count": 0,
        "current_page": 1
    }
    let query = `
        SELECT *, 'Inventory Log' as doctype, COUNT(*) OVER() AS total_count
        FROM inventory
        WHERE name NOT NULL
    `;
    // Applying filters
    let archiveStatus = " AND archived = 0"
    if (filters) {
        query += filters.archived ? ` AND archived = ${filters.archived}` : archiveStatus;

        if (filters.item_code && filters.item_code.length > 0) {
            const items = filters.item_code.map(item => `"${item}"`).join(",");
            query += ` AND item_code IN (${items})`;
        }
        if (filters.building) {
            query += ` AND building = "${filters.building}"`;
        }
    }
    query += archiveStatus
    if (searchText) {
        query += ` AND (item_code LIKE "%${filters}%" OR building LIKE "%${filters}%")`;
    }
    query += " GROUP BY item_code, floor";
    query += " ORDER BY creation DESC";
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    console.log(query)
    try {
      const inventoryList = await this.db.query(query);
      if (inventoryList.values && inventoryList.values.length > 0) {
        let total_count = 0
        if (inventoryList.values) total_count = inventoryList.values[0]["total_count"]
        const pageCount = Math.ceil(total_count / limit);
        const image = await loadImage("noimage.jpg", false, "BaseImages")
        const inventoryRecords = await Promise.all(inventoryList.values.map(async (obj) => {
          const attachments = await this.getAttachmentList(obj.name);
          const imageUrl = (attachments && attachments.length > 0) ? attachments[attachments.length - 1].url : image;
          return { ...obj, image: imageUrl };
        }));
        response = {
          "records": inventoryRecords,
          "total_count": total_count,
          "page_count": pageCount,
          "current_page": page
        }
        return response
      }
      return response; // No item found
    } catch (error) {
        console.error("Error fetching item:", error);
        return response; // Handle errors gracefully
    }
  }

  async fetchOfflineData(tableName, columnName="name"){
    const query = `SELECT ${columnName} FROM ${tableName}`;
    try {
        const records = await this.db.query(query);
        if (records.values && records.values.length > 0) {
          return records.values.map(record => record[columnName]);
        }
        return []; // No records found
    } catch (error) {
        console.error(`Error fetching ${columnName} from ${tableName}:`, error);
        return []; // Handle errors gracefully
    }
  }

  async getOfflineInventoryInfo(logId){
    const query = `SELECT * FROM inventory where name="${logId}"`;
    try {
        const inventory = await this.db.query(query);
        if (inventory.values && inventory.values.length > 0) {
          let inventoryObj = inventory.values[0]
          inventoryObj["attachments"] = await this.getAttachmentList(logId)
          return inventoryObj
        }
        return {}; // No item found
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return {}; // Handle errors gracefully
    }
  }

  async getAttachmentList(inventoryId){
    const query = `SELECT id, file_name, file_path FROM attachments where inventory_id="${inventoryId}"`
    const attachmentList = await this.db.query(query);
    if (attachmentList.values && attachmentList.values.length > 0){
      attachmentList.values = await Promise.all(
        attachmentList.values.map(async (obj) => ({
          ...obj,
          url: await loadImage(obj.file_name), // Await inside async function
          download_url: await loadImage(obj.file_name),
        }))
      );
      return attachmentList.values
    }
    return []
  }

  async getOfflineInventoryData(params){
    const query = `SELECT * FROM inventory where item_code="${params.item_code}" and floor="${params.floor}"`;
    try {
        const inventory = await this.db.query(query);
        if (inventory.values && inventory.values.length > 0) {
          let inventoryObj = inventory.values[0]
          inventoryObj["attachments"] = []
          return inventoryObj
        }
        return {}; // No item found
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return {}; // Handle errors gracefully
    }
  }

  async inventoryOfflineSubmit(formData){
    const name = Math.random().toString(36).substr(2, 5);
    formData["name"] = name
    const { attachments, ...newObj } = formData;
    const updatedObj = { ...newObj, ["islocal"]: 1 };
    const keys = Object.keys(updatedObj).join(", ");
    const values = Object.values(updatedObj).map(value =>
        value === null ? "NULL" : `'${value}'`
    ).join(", ");
    console.log(attachments)
    for (const attachment of attachments) {
      const sql = `UPDATE attachments
                   SET inventory_id = ?
                   WHERE id = ?`;
      await this.db.run(sql, [name, attachment.id]);
      if (this.platform === "web") {
        await this.sqliteServ.saveToStore(this.database);
      }
    }
    // Construct SQL query
    const sql = `INSERT INTO inventory (${keys}) VALUES (${values});`;
    await this.db.run(sql);
    await Preferences.set({key: 'syncStatus', value: JSON.stringify(false)})
    await Preferences.set({key: 'localClearedStatus', value: JSON.stringify(false)})
    updateSyncTime()
    if (this.platform === "web") {
      await this.sqliteServ.saveToStore(this.database);
    }
  }

  async inventoryOfflineUpdate(formData){
    console.log("GOT MEAN")
    const { attachments, name, ...newObj } = formData; // Assume 'id' is used for identifying the record
    const updatedObj = { ...newObj, isupdated: 1 }; // Ensure isupdated is a boolean (1)

    const setClause = Object.entries(updatedObj)
        .map(([key, value]) => `${key} = ${value === null ? "NULL" : typeof value === "boolean" ? Number(value) : `'${value}'`}`)
        .join(", ");

    const sql = `UPDATE inventory SET ${setClause} WHERE name = '${name}';`;
    console.log(sql)
    const inventory = await this.db.run(sql);
    if (this.platform === "web") {
      await this.sqliteServ.saveToStore(this.database);
    }
    // attachments
    // const attachQuery = `UPDATE attachments SET inventory_id=${name} where id=${}`
    for (const attachment of attachments) {
      const sql = `UPDATE attachments
                   SET inventory_id = ?
                   WHERE id = ?`;
      const g = await this.db.run(sql, [name, attachment.id]);
      if (this.platform === "web") {
        await this.sqliteServ.saveToStore(this.database);
      }
    }
    await Preferences.set({key: 'syncStatus', value: JSON.stringify(false)})
    await Preferences.set({key: 'localClearedStatus', value: JSON.stringify(false)})
    await updateSyncTime()
  }

  async updateArchiveOffline(params){
    const sql = `UPDATE inventory SET archived=${params.archive_status} WHERE name = '${params.name}';`;
    const inventory = await this.db.run(sql);
    if (this.platform === "web") {
      await this.sqliteServ.saveToStore(this.database);
    }
  }

  async uploadAttachmentOffline(logId, content, fileName){
    const fileUri = await saveImage(content, fileName)
    const id = Math.random().toString(36).substr(2, 5);
    const sql = `INSERT INTO attachments (id, file_name, file_path, inventory_id) VALUES ("${id}", "${fileName}", "${fileUri}", "${logId? logId : null }");`;
    const inventory = await this.db.run(sql);
    if (this.platform === "web") {
      await this.sqliteServ.saveToStore(this.database);
    }
    // const query = `SELECT id FROM attachments ORDER BY creation DESC LIMIT 1;`;
    const response = {
      "id": id,
      "filename": fileName,
      "url": await loadImage(fileName),
      "download_url": await loadImage(fileName),
    }
    return response
  }

  async removeAttachmentOffline(attachmentId){
    const query = `SELECT file_name FROM attachments where id="${attachmentId}"`;
    const file_name_list = await this.db.query(query);
    let file_name
    if (file_name_list.values && file_name_list.values.length > 0) {
      file_name = file_name_list.values[0].file_name
    }
    try{
      await deleteImage(file_name)
      const sql = `DELETE FROM attachments WHERE id="${attachmentId}"`;
      await this.db?.run(sql);
      if (this.platform === "web") {
        await this.sqliteServ.saveToStore(this.database);
      }
    }
    catch (error) {
      console.error("Error fetching inventory:", error);
      return {}; // Handle errors gracefully
    }
  }

  async getUpdatedInventoryRecords(){
    try {
      const query = `SELECT * FROM inventory where islocal=1 or isupdated=1`
      let inventoryList = await this.db.query(query);
      const inventories = inventoryList.values
      if (!inventories.length) return [];
        const inventoryIds = inventories.map(inventory => `'${inventory.name}'`).join(", ");
        const attachmentQuery = `SELECT * FROM attachments WHERE inventory_id IN (${inventoryIds})`;
        const attachments = (await this.db.query(attachmentQuery)).values
        const updatedAttachments = await Promise.all(
            attachments.map(async (attachment) => ({
                ...attachment,
                content: await loadImage(attachment.file_name, true) // Load image asynchronously
            }))
        );
        // const attachmentLists = attachments.map(attachment => loadImage(attachment.file_name))
        const inventoryMap = inventories.map(inv => ({
          ...inv,
          attachments: updatedAttachments.filter(att => att.inventory_id === inv.name) // Attach matching attachments
        }));
        return inventoryMap
    } catch (error) {
        console.error("Error fetching item:", error);
        return []; // Handle errors gracefully
    }
  }

  async updateSyncedRecords(updatedRecords){
    for (const record of updatedRecords) {
      const inventorySql = `UPDATE inventory
                   SET name = ?
                   WHERE name = ?`;
      await this.db.run(inventorySql, [record.new_name, record.old_name]);
      const attachmentSql = `UPDATE attachments
                   SET inventory_id = ?
                   WHERE inventory_id = ?`;
      await this.db.run(attachmentSql, [record.new_name, record.old_name]);
      if (this.platform === "web") {
        await this.sqliteServ.saveToStore(this.database);
      }
    }
    const inventorySql = `UPDATE inventory SET isupdated=0, islocal=0`;
    await this.db.run(inventorySql);
    if (this.platform === "web") {
      await this.sqliteServ.saveToStore(this.database);
    }
  }

  async clearTable(tableName){
    await this.db.run(`DELETE FROM ${tableName};`);
    if (this.platform === "web") {
      await this.sqliteServ.saveToStore(this.database);
    }
  }

  async addUser(user) {
    // add a user to the database
    const colList = Object.keys(user).slice(1).toString();
    const valArr = Object.values(user).slice(1);
    const valList = valArr
      .map((value) => (typeof value === "string" ? `'${value}'` : value))
      .join(",");

    const sql = `INSERT INTO users (${colList}) VALUES (${valList});`;
    const res = await this.db?.run(sql, []);
    if (
      res?.changes !== undefined &&
      res.changes.lastId !== undefined &&
      res.changes.lastId > 0
    ) {
      return res.changes.lastId;
    } else {
      throw new Error("storageService.addUser: lastId not returned");
    }
  }

  async deleteUserById(id) {
    // delete a user by id from the database
    const sql = `DELETE FROM users WHERE id=${id}`;
    await this.db?.run(sql);
  }

  getDatabaseName() {
    // return the database name
    return this.database;
  }

  getDatabaseVersion() {
    // return the database version
    return this.loadToVersion;
  }

  async getUsers() {
    // return all users
    return (await this.db?.query("SELECT * FROM users;"))?.values;
  }

  async initializeDatabase() {
    // initialize the database
    try {
      // create upgrade statements
      await this.sqliteServ.addUpgradeStatement({
        database: this.database,
        upgrade: this.versionUpgrades,
      });
      // open the connection to the database with the latest version
      // and then open the database
      this.db = await this.sqliteServ.openDatabase(
        this.database,
        this.loadToVersion,
        false
      );
      const isData = await this.db?.query("select * from sqlite_sequence");
      if (isData?.values && isData.values.length === 0) {
        // create database initial users if any
      }
      // store the database version
      this.dbVerServ.setDbVersion(this.database, this.loadToVersion);
      if (this.platform === "web") {
        await this.sqliteServ.saveToStore(this.database);
      }
      this.isInitCompleted.next(true);
    } catch (error) {
      const msg = error.message ? error.message : error;
      throw new Error(`storageService.initializeDatabase: ${msg}`);
    }
  }

  async replaceUser(user) {
    const colList = Object.keys(user).toString();
    const valArr = Object.values(user);
    const valList = valArr
      .map((value) => (typeof value === "string" ? `'${value}'` : value))
      .join(",");
    const sql = `INSERT OR REPLACE INTO users (${colList}) VALUES (${valList});`;
    const res = await this.db?.run(sql, []);
    if (
      res?.changes !== undefined &&
      res.changes.lastId !== undefined &&
      res.changes.lastId > 0
    ) {
      return;
    } else {
      throw new Error("storageService.replaceUser: lastId not returned");
    }
  }

  async updateUserActiveById(id, active) {
    const sql = `UPDATE users SET active=${active} WHERE id=${id}`;
    await this.db?.run(sql);
  }
}

async function updateSyncTime(){
  const nextSync = (await Preferences.get({ key: 'nextSyncTime' })).value;
  console.log(nextSync)
  if (!nextSync){
    await Preferences.set({
      key: 'nextSyncTime',
      value: await getTime(24)
    });
    await Preferences.set({
      key: 'localEditInitiate',
      value: await getTime()
    });
  }
}

export default StorageService;
