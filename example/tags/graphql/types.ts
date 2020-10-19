import { Field, ID, ObjectType } from 'type-graphql';
import { Post } from '../../posts/graphql/types';

@ObjectType({ description: 'Tag type' })
export class Tag {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field((type) => [Post], { nullable: true })
  posts?: Post[];
}
