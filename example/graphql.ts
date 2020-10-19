import 'reflect-metadata';
import { PostResolvers } from './posts/graphql/resolvers';
import { TagResolvers } from './tags/graphql/resolvers';

const resolvers: readonly [Function, ...Function[]] = [PostResolvers, TagResolvers];

export default resolvers;
