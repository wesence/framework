import { createModule, gql } from 'graphql-modules';
import { buildTypeDefsAndResolvers } from 'type-graphql';
import { PostResolvers } from './graphql/resolvers';
import { Tag } from '../tags/graphql/types';

let postModule: any;

export default async function getModule() {
  if (!postModule) {
    const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
      resolvers: [PostResolvers],
      orphanedTypes: [Tag],
    });

    postModule = createModule({
      id: 'posts',
      dirname: __dirname,
      typeDefs: gql(typeDefs),
      resolvers,
    });
  }

  return postModule;
}
