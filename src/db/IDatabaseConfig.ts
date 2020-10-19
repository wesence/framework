import { DbCreateOptions } from 'mongodb';
import DBType from './DBTypes';

export default interface IDatabaseConfig {
  type: DBType;
  url: string;
  options: DbCreateOptions;
  default?: boolean;
}
