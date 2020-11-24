import IMiddlewareConfig from '../middlewares/IMiddlewareConfig';
import IDatabaseConfig from '../db/IDatabaseConfig';

export default interface IAppConfig extends IMiddlewareConfig {
  target?: 'koa' | 'serverless';
  port?: number;
  databases?: { [key: string]: IDatabaseConfig };
  session?: {
    issuer?: string;
    expiresIn: string;
    secret: string;
  };
  aws?: {
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
    s3?: {
      accessKeyId: string;
      secretAccessKey: string;
      bucket: string;
      region?: string;
    };
  };
}
