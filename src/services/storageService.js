import { BehaviorSubject } from "rxjs";
import { getCurrentInstance } from "vue";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { UserUpgradeStatements } from "src/upgrades/user.statements";
import { Preferences } from '@capacitor/preferences';

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
  platform;

  constructor(sqliteService, dbVersionService) {
    this.sqliteServ = sqliteService;
    this.dbVerServ = dbVersionService;
    this.platform =
      this.appInstance?.appContext.config.globalProperties.$platform;
  }

  async getOfflineDashBuilding() {
    const buildingQuery = "SELECT name FROM building LIMIT 1";
    try {
        const building = await this.db.query(buildingQuery);
        if (building.values && building.values.length > 0) {
          console.log(building.values)
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
          console.log(building.values)
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
    if (filters) {
        query += filters.archived ? ` AND archived = ${filters.archived}` : " AND archived = 0";

        if (filters.item_code && filters.item_code.length > 0) {
            const items = filters.item_code.map(item => `"${item}"`).join(",");
            query += ` AND item_code IN (${items})`;
        }

        if (filters.building) {
            query += ` AND building = "${filters.building}"`;
        }
    }
    // Applying search text condition
    if (searchText) {
        query += ` AND (item_code LIKE "%${filters}%" OR building LIKE "%${filters}%")`;
    }
    query += " GROUP BY item_code, floor";
    // query += " ORDER BY creation DESC";
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    try {
      console.log(query)
      const inventoryList = await this.db.query(query);
      if (inventoryList.values && inventoryList.values.length > 0) {
        let total_count = 0
        if (inventoryList.values) total_count = inventoryList.values[0]["total_count"]
        const pageCount = Math.ceil(total_count / limit);
        response = {
          "records": inventoryList.values,
          "total_count": total_count,
          "page_count": pageCount,
          "current_page": page
        }
        console.log(response)
        return response
      }
      return response; // No item found
    } catch (error) {
        console.error("Error fetching item:", error);
        return response; // Handle errors gracefully
    }
  }

  async addUser(user) {
    // add a user to the database
    console.log("FFFFFF");
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
    console.log(await this.db?.query("SELECT * FROM users;"));
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

export default StorageService;
