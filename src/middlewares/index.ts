import kcors from '@koa/cors';
import compression from 'koa-compress';
import serve, { Options as StaticOptions } from 'koa-static';
import helmet from 'koa-helmet';
import IMiddlewareConfig from './IMiddlewareConfig';

export default function prepareMiddlewares(config?: IMiddlewareConfig): any[] {
  const middlewares: any[] = [];

  if (!config) {
    return middlewares;
  }

  middlewares.push([helmet, config.helmet]);
  middlewares.push([kcors, config.cors]);
  middlewares.push([compression, config.compression]);

  const staticMiddlewares = prepareStatic(config.static);
  middlewares.push(...staticMiddlewares);

  return middlewares;
}

function prepareStatic(config?: { enabled?: boolean } | StaticOptions | StaticOptions[]): any[] {
  if (!config) {
    return [];
  }

  const configs = Array.isArray(config) ? config : [config];
  return configs.map((row) => [(settings: any) => serve(settings.directory, settings.options || {}), row]);
}
