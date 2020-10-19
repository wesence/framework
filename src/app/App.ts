import Koa from 'koa';
import prepareMiddlewares from '../middlewares';
import IAppConfig from './IAppConfig';
import { initializeDatabases } from '../db';
import { ApolloServer, Config, makeApolloServer } from '../graphql/server';
import { Server } from 'http';
import { graphqlUploadKoa } from 'graphql-upload';
import { BuildSchemaOptions } from 'type-graphql/dist/utils/buildSchema';
import { buildTypeDefsAndResolvers } from 'type-graphql';

export class App {
  private graphQLServer?: ApolloServer;

  private httpServer: any;

  private app: Koa;

  private config?: IAppConfig;

  constructor(config?: IAppConfig) {
    this.app = new Koa();

    if (config) {
      this.config = config;
    }
  }

  async configure(config: IAppConfig): Promise<void> {
    this.config = config;
    await this.init();
  }

  private async init(): Promise<void> {
    this.mountBasicMiddlewares();
    await initializeDatabases();
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  applyMiddleware(middleware: Function, options?: any): void {
    // Do not apply middleware if options is present and enabled is false
    if (options && Object.keys(options).length && options.enabled !== undefined && !options.enabled) {
      return;
    }
    this.app.use(middleware(options));
  }

  private mountBasicMiddlewares(): void {
    const middlewares = prepareMiddlewares(this.config);

    middlewares.forEach(([middleware, options]) => {
      this.applyMiddleware(middleware, options);
    });
  }

  listen(port?: number): Server {
    let defaultPort;
    if (this.config) {
      defaultPort = this.config.port || 8080;
    }
    this.httpServer = this.app.listen(port || defaultPort);
    console.log(`Listening to ${port || defaultPort}`);
    return this.httpServer;
  }

  getInstance(): Koa {
    return this.app;
  }

  async initializeGraphQL(schemaOptions: BuildSchemaOptions): Promise<void> {
    const { typeDefs, resolvers } = await buildTypeDefsAndResolvers(schemaOptions);

    const finalOptions: Config = {
      typeDefs,
      resolvers,
      playground: true,
      introspection: true,
      debug: true,
      tracing: true,
    };

    this.graphQLServer = makeApolloServer(finalOptions);

    this.app.use(graphqlUploadKoa());

    this.graphQLServer.applyMiddleware({ app: this.app });
  }
}

const app = new App();

export default app;
