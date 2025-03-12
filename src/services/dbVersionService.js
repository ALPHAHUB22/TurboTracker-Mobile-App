class DbVersionService {
  constructor() {
    this.dbNameVersionDict = new Map();
  }

  getDbVersion(dbName) {
    const version = this.dbNameVersionDict.get(dbName);
    return version;
  }

  setDbVersion(dbName, version) {
    this.dbNameVersionDict.set(dbName, version);
  }
}

export default DbVersionService;
