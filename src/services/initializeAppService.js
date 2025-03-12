class InitializeAppService {
  constructor(sqliteService, storageService) {
    this.appInit = false;
    this.sqliteServ = sqliteService;
    this.storageServ = storageService;
    this.platform = this.sqliteServ.getPlatform();
  }

  async initializeApp() {
    if (!this.appInit) {
      try {
        if (this.platform === 'web') {
          await this.sqliteServ.initWebStore();
        }
        // Initialize the myuserdb database
        await this.storageServ.initializeDatabase();
        if (this.platform === 'web') {
          await this.sqliteServ.saveToStore(this.storageServ.getDatabaseName());
          console.log(this.sqliteServ)
        }
        this.appInit = true;
      } catch (error) {
        const msg = error.message ? error.message : error;
        throw new Error(`initializeAppError.initializeApp: ${msg}`);
      }
    }
    return this.appInit;
  }
}

export default InitializeAppService;
