import Registry from '../utils/Registry';

export default class ServiceRegistry extends Registry {
  constructor() {
    super('Service');
  }

  register(key: string, item: any): boolean {
    const service: any = typeof item === 'function' && item.constructor ? new item() : item;

    return super.registerItem(key, service);
  }

  get(key: string): any {
    return super.getItem(key);
  }
}
