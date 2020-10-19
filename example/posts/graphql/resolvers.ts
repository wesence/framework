import { PostService } from '../Service';
import { Query, Resolver } from 'type-graphql';
import { Post } from './types';

@Resolver(Post)
export class PostResolvers {
  private service: PostService;

  constructor() {
    this.service = new PostService();
  }

  @Query((type) => [Post])
  async posts() {
    return this.service.list();
  }
}
