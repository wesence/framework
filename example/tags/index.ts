import { createModule, gql } from 'graphql-modules';
import { buildTypeDefsAndResolvers } from 'type-graphql';
import { TagResolvers } from './graphql/resolvers';

let tagModule: any;

export default async function getModule() {
  if (!tagModule) {
    const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
      resolvers: [TagResolvers],
      skipCheck: true,
    });

    tagModule = createModule({
      id: 'tags',
      dirname: __dirname,
      typeDefs: gql(typeDefs),
      resolvers,
    });
  }

  return tagModule;
}
