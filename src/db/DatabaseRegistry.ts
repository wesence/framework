import Registry from '../utils/Registry';
import Database from './Database';

export default class DatabaseRegistry extends Registry {
  constructor() {
    super('Database');
  }

  get default() {
    return super.getItem('default');
  }

  register(key: string, value: Database) {
    super.registerItem(key, value);

    if (this.count() === 1) {
      this.setDefault(value);
    }
  }

  get(key: string): Database {
    return super.getItem(key);
  }

  setDefault(keyOrValue: string | Database) {
    if (typeof keyOrValue === 'string') {
      super.registerItem('default', this.get(keyOrValue));
      return;
    }

    super.registerItem('default', keyOrValue);
  }
}
