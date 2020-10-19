import { Options as CORSOptions } from '@koa/cors';
import { CompressOptions } from 'koa-compress';
import { Options as StaticOptions } from 'koa-static';

export default interface IMiddlewareConfig {
  helmet?: {
    enabled?: boolean;
  };
  cors?: { enabled?: boolean } | CORSOptions;
  compression?: { enabled?: boolean } | CompressOptions;
  static?: { enabled?: boolean } | StaticOptions | StaticOptions[];
}
