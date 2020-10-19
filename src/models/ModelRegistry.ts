import Registry from '../utils/Registry';

export default class ModelRegistry extends Registry {
  constructor() {
    super('Model');
  }

  register(key: string, item: any): boolean {
    return super.registerItem(key, item);
  }

  get(key: string): any {
    return super.getItem(key);
  }
}
