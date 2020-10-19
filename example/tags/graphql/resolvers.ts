import { TagService } from '../Service';
import { Query, Resolver } from 'type-graphql';
import { Tag } from './types';

@Resolver(Tag)
export class TagResolvers {
  private service: TagService;

  constructor() {
    this.service = new TagService();
  }

  @Query((type) => [Tag])
  async tags() {
    return this.service.list();
  }
}
