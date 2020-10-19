import IDatabaseConfig from './IDatabaseConfig';
import DBType from './DBTypes';
import Mongo from './Mongo';
import DatabaseRegistry from './DatabaseRegistry';
import { parseDatabases } from '../utils';

export { default as Mongo } from './Mongo';
export { default as IDatabaseConfig } from './IDatabaseConfig';
export { default as DBType } from './DBTypes';

export const databases = new DatabaseRegistry();

export async function initializeDatabases() {
  const { databases: databaseConfigs = {} } = parseDatabases();

  const databaseNames = Object.keys(databaseConfigs);

  await Promise.all(
    databaseNames.map(async (key) => {
      const config: IDatabaseConfig = databaseConfigs[key];

      let db;

      if ([DBType.MONGODB, DBType.MONGO].includes(config.type)) {
        db = new Mongo(config);
      } else {
        throw new Error(`${config.type} is not Supported`);
      }

      await db.connect();

      databases.register(key, db);

      //@TODO: Switch to a logger
      console.log(`Connected to database ${key}`);
    }),
  );
}
