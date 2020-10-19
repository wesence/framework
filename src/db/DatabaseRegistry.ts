import Registry from '../utils/Registry';
import Mongo from './Mongo';

export default class DatabaseRegistry extends Registry {
  constructor() {
    super('Database');
  }

  get default(): Mongo {
    return super.getItem('default');
  }

  register(key: string, value: Mongo) {
    super.registerItem(key, value);

    if (this.count() === 1) {
      this.setDefault(value);
    }
  }

  get(key: string): Mongo {
    return super.getItem(key);
  }

  setDefault(keyOrValue: string | Mongo) {
    if (typeof keyOrValue === 'string') {
      super.registerItem('default', this.get(keyOrValue));
      return;
    }

    super.registerItem('default', keyOrValue);
  }
}
