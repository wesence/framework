import { app, initializeDatabases } from '../src';
import config from './config';
import resolvers from './graphql';

async function bootstrap() {
  await app.configure(config);
  await initializeDatabases();
  await app.initializeGraphQL({ resolvers });
  app.listen();
}

bootstrap().catch(console.error);
