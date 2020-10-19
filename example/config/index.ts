import { IAppConfig, parseEnv } from '../../src';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { resolve } from 'path';

const env = dotenv.config({ path: resolve('./.env') });
dotenvExpand(env);

const envConfig = parseEnv();

const config: IAppConfig = {
  ...envConfig,
  static: {
    enabled: false,
  },
};

export default Object.freeze(config);
