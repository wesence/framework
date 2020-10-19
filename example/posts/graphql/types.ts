import { Field, ID, ObjectType } from 'type-graphql';
import { Tag } from '../../tags/graphql/types';

@ObjectType({ description: 'Post type' })
export class Post {
  @Field((type) => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field((type) => Tag, { nullable: true })
  tags?: Tag[];
}
