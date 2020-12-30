import mongoose, { Connection, Document, Model, Schema } from 'mongoose';
import Database from './Database';
import { models } from '../models';
import transformerPlugin from './plugins/mongo/transformer';

const DEFAULT_OPTIONS = {
  useNewUrlParser: true,
  // useUnifiedTopology: true,
  useCreateIndex: true,
};

const DEFAULT_URL = `mongodb://localhost:27017/${process.env.npm_package_name}`;

mongoose.plugin(transformerPlugin);

export default class Mongo extends Database {
  protected instance: Connection;

  async connect(): Promise<Connection> {
    if (!this.config) {
      throw new Error('Missing Config');
    }
    const { url, options } = this.config;
    this.instance = await mongoose.createConnection(url || DEFAULT_URL, {
      ...DEFAULT_OPTIONS,
      ...options,
    });
    return this.instance;
  }

  registerModel<T>(name: string, schema: Schema, collectionName?: string): Model<T & Document> {
    if (!this.instance) {
      throw new Error('DB not connected');
    }

    const model = this.instance.model<T & Document>(name, schema, collectionName);

    models.register(name, model);

    return model;
  }

  getModel<T>(name: string): Model<T & Document> {
    if (!this.instance) {
      throw new Error('DB not connected');
    }

    return this.instance.model(name);
  }
}
