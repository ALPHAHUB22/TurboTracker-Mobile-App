import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

class SQLiteService {
  constructor() {
    this.platform = Capacitor.getPlatform();
    this.sqlitePlugin = CapacitorSQLite;
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    this.dbNameVersionDict = new Map();
  }

  async addUpgradeStatement(options) {
    try {
      await this.sqlitePlugin.addUpgradeStatement(options);
    } catch (error) {
      const msg = error.message ? error.message : error;
      throw new Error(`sqliteService.addUpgradeStatement: ${msg}`);
    }
  }

  async closeDatabase(dbName, readOnly) {
    try {
      const isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
      if (isConn) {
        await this.sqliteConnection.closeConnection(dbName, readOnly);
      }
    } catch (error) {
      const msg = error.message ? error.message : error;
      throw new Error(`sqliteService.closeDatabase: ${msg}`);
    }
  }

  getPlatform() {
    return this.platform;
  }

  async initWebStore() {
    try {
      await this.sqliteConnection.initWebStore();
    } catch (error) {
      const msg = error.message ? error.message : error;
      throw new Error(`sqliteService.initWebStore: ${msg}`);
    }
  }

  async isConnection(dbName, readOnly) {
    try {
      const isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
      if (isConn !== undefined) {
        return isConn;
      } else {
        throw new Error('sqliteService.isConnection undefined');
      }
    } catch (error) {
      const msg = error.message ? error.message : error;
      throw new Error(`sqliteService.isConnection: ${msg}`);
    }
  }

  async openDatabase(dbName, loadToVersion, readOnly) {
    this.dbNameVersionDict.set(dbName, loadToVersion);
    const encrypted = false;
    const mode = encrypted ? 'secret' : 'no-encryption';
    try {
      let db;
      const retCC = (await this.sqliteConnection.checkConnectionsConsistency()).result;
      const isConn = (await this.sqliteConnection.isConnection(dbName, readOnly)).result;
      if (retCC && isConn) {
        db = await this.sqliteConnection.retrieveConnection(dbName, readOnly);
      } else {
        db = await this.sqliteConnection.createConnection(dbName, encrypted, mode, loadToVersion, readOnly);
      }
      await db.open();
      const res = await db.isDBOpen();
      if (!res.result) {
        throw new Error('sqliteService.openDatabase: database is not opened');
      }
      return db;
    } catch (error) {
      const msg = error.message ? error.message : error;
      throw new Error(`sqliteService.openDatabase: ${msg}`);
    }
  }

  async saveToLocalDisk(dbName) {
    try {
      await this.sqliteConnection.saveToLocalDisk(dbName);
    } catch (error) {
      const msg = error.message ? error.message : error;
      throw new Error(`sqliteService.saveToLocalDisk: ${msg}`);
    }
  }

  async saveToStore(dbName) {
    try {
      await this.sqliteConnection.saveToStore(dbName);
    } catch (error) {
      const msg = error.message ? error.message : error;
      throw new Error(`sqliteService.saveToStore: ${msg}`);
    }
  }
}

export default SQLiteService;
