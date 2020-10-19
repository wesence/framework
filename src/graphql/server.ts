import { ApolloServer, Config } from 'apollo-server-koa';

export { ApolloServer, Config } from 'apollo-server-koa';

export function makeApolloServer(options: Config): ApolloServer {
  return new ApolloServer({ ...options, uploads: false });
}
