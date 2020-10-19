import IDatabaseConfig from './IDatabaseConfig';

export interface IDatabase {
  configure(config: IDatabaseConfig): void;

  connect?(): Promise<any>;

  getInstance(): any;
}

export default class Database implements IDatabase {
  protected config?: IDatabaseConfig;

  protected instance: any;

  constructor(config?: IDatabaseConfig) {
    if (config) {
      this.configure(config);
    }
  }

  configure(config: IDatabaseConfig): void {
    this.config = config;
  }

  getInstance(): any {
    return this.instance;
  }
}
