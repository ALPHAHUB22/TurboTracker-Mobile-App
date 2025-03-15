export const UserUpgradeStatements = [
  {
    toVersion: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          active INTEGER DEFAULT 1
      );`,
      `CREATE TABLE IF NOT EXISTS building (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
      );`,
      `CREATE TABLE IF NOT EXISTS floor (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS inventory (
          name TEXT PRIMARY KEY,
          item_code TEXT NOT NULL,
          building TEXT NOT NULL,
          floor TEXT NOT NULL,
          manufacturer TEXT NOT NULL,
          new_qty INTEGER NOT NULL,
          qty INTEGER NOT NULL,
          damaged_qty INTEGER NOT NULL,
          incomplete_qty INTEGER NOT NULL,
          depth REAL,
          width REAL,
          diameter REAL,
          height REAL,
          description TEXT,
          archived INTEGER NOT NULL DEFAULT 0
      );`
    ],
  },
  /* add new statements below for next database version when required*/
  /*
  {
    toVersion: 2,
    statements: [
        `ALTER TABLE users ADD COLUMN email TEXT;`,
    ],
  },
  */
];
