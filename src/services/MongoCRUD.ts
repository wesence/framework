import validator from 'validator';
import { models } from '../models';
import { ID } from '../db/types';

export interface ICRUDService {
  modelName?: string;
  Model?: any;

  list(conditions: any, { sort, select, populate, page, pageSize }: CRUDOptions): Promise<any>;

  create(data: any, { populate }: CRUDOptions): Promise<any>;

  findOne(conditions: any, { select, populate }: CRUDOptions): Promise<any>;

  findById(id: ID, { conditions, select, populate }: CRUDOptions): Promise<any>;

  update(id: ID, updates: any, { select, populate, conditions }: CRUDOptions): Promise<any>;

  markDeleted(id: ID, { select, populate, conditions }: CRUDOptions): Promise<any>;

  remove(id: ID): Promise<any>;
}

export interface CRUDOptions {
  conditions?: any;
  populate?: string | string[] | any | any[];
  select?: string | string[];
  sort?: string | string[];
  page?: number;
  pageSize?: number;
}

export class MongoCRUD implements ICRUDService {
  modelName: string;

  protected model: any;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  get Model(): any {
    if (!this.model) {
      this.model = models.get(this.modelName);
    }

    return this.model;
  }

  public async create(data: any, options?: CRUDOptions): Promise<any> {
    const { populate = '' } = options || {};

    const instance = new this.Model(data);
    await instance.save();

    if (populate) {
      await instance.populate(populate || '').execPopulate();
    }
    return instance;
  }

  public async findOne(conditions: any, options?: CRUDOptions): Promise<any> {
    const { select, populate } = options || {};

    const instance = await this.Model.findOne(conditions)
      .select(select || '')
      .populate(populate || '');

    return instance;
  }

  public async findById(id: ID, options?: CRUDOptions): Promise<any> {
    if (!validator.isMongoId(id ? id.toString() : '')) {
      throw new Error('Invalid id');
    }

    const { conditions, select, populate } = options || {};

    const allConditions = { ...(conditions || {}), _id: id };

    return this.findOne(allConditions, { select, populate });
  }

  public async list(conditions: any, options?: CRUDOptions): Promise<any> {
    const { sort = '', select, populate = '', page = 1, pageSize = 20 } = options || {};

    const skip = page === -1 ? 0 : (page - 1) * Number(pageSize);

    const countTask = this.Model.count(conditions);
    const itemsTask = this.Model.find(conditions)
      .skip(skip)
      .limit(page === -1 ? undefined : Number(pageSize))
      .populate(populate)
      .select(select)
      .sort(sort)
      .exec();

    const [count, items] = await Promise.all([countTask, itemsTask]);

    const pageCount = Math.ceil(count / Number(pageSize));

    return { items, pagination: { pageSize, page, total: count, pageCount } };
  }

  public async update(id: ID, updates: any, options?: CRUDOptions): Promise<any> {
    if (!validator.isMongoId(id ? id.toString() : '')) {
      throw new Error('Invalid id');
    }

    const { select, populate, conditions } = options || {};

    const allConditions = { ...(conditions || {}), _id: id };
    const instance = await this.Model.findOneAndUpdate(allConditions, { $set: updates }, { new: true })
      .select(select)
      .populate(populate || '')
      .exec();

    if (!instance) {
      throw new Error(`${this.modelName} not found`);
    }

    return instance;
  }

  public async markDeleted(id: ID, options?: CRUDOptions): Promise<any> {
    const { select, populate, conditions } = options || {};
    return this.update(id, { deleted: true }, { conditions, select, populate });
  }

  public async remove(id: ID): Promise<any> {
    const instance = await this.Model.findByIdAndRemove(id).exec();
    if (!instance) {
      throw new Error(`${this.modelName} do not exist`);
    }
    return instance;
  }
}
