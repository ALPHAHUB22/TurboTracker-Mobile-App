import { boot } from "quasar/wrappers";
import { provide } from "vue";
import { Capacitor } from "@capacitor/core";
// import { JeepSqlite } from 'jeep-sqlite';
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

import { JeepSqlite } from "jeep-sqlite/dist/components/jeep-sqlite";
import SqliteService from "src/services/sqliteService";
import DbVersionService from "src/services/dbVersionService";
import StorageService from "src/services/storageService";
import InitializeAppService from "src/services/initializeAppService";
import { Preferences } from '@capacitor/preferences';

// ✅ Quasar Boot Function
export default boot(async ({ app }) => {
  const dbName = "ttrDB"
  await Preferences.set({
    key: 'dbName',
    value: dbName
  });
  const sqliteServ = new SqliteService();
  const dbVersionServ = new DbVersionService();
  const storageServ = new StorageService(sqliteServ, dbVersionServ);
  const initAppServ = new InitializeAppService(sqliteServ, storageServ);

  // Provide dependencies globally
  app.provide('sqliteServ', sqliteServ);
  app.provide('dbVersionServ', dbVersionServ);
  app.provide('storageServ', storageServ);

  // Define custom element
  customElements.define('jeep-sqlite', JeepSqlite);
  const platform = Capacitor.getPlatform();

  // Initialize app service
  let dbConnection = null
  const initApp = async () => {
    try {
      await initAppServ.initializeApp();
      dbConnection = await sqliteServ.openDatabase(dbName);
      console.log('SQLite Initialized');
    } catch (error) {
      console.error('App Initialization error:', error);
    }
  };
  // Execute initialization
  if (platform !== 'web') {
    await initApp();
  } else {
    const jeepEl = document.createElement('jeep-sqlite');
    document.body.appendChild(jeepEl);
    try {
      await customElements.whenDefined('jeep-sqlite');
      await initApp();
    } catch (err) {
      console.error('jeep-sqlite creation error:', err);
    }
  }

  // ✅ Provide database functions globally
  app.provide('dbConnection', dbConnection);
});