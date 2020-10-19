export default class Registry {
  protected name: string;

  private readonly items: any;

  constructor(name: string) {
    this.name = name;
    this.items = {};
  }

  count(): number {
    return Object.keys(this.items).length;
  }

  protected registerItem(key: string, item: any): boolean {
    if (key in Object.keys(this.items)) {
      throw new Error(`A ${this.name} with key ${key} is already registered`);
    }

    this.items[key] = item;
    return true;
  }

  protected getItem(key: string): any {
    if (!this.items[key]) {
      throw new Error(`A ${this.name} with key ${key} is not registered`);
    }

    return this.items[key];
  }
}
