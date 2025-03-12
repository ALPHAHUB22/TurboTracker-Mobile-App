import { BehaviorSubject } from "rxjs";
import { getCurrentInstance } from "vue";
import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { UserUpgradeStatements } from "src/upgrades/user.statements";

class StorageService {
  versionUpgrades = UserUpgradeStatements;
  loadToVersion =
    UserUpgradeStatements[UserUpgradeStatements.length - 1].toVersion;
  db; // SQLiteDBConnection or undefined
  database = "ttdatabase";
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
