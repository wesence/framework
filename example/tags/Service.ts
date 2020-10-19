import Model, { TagModel } from './Model';

export class TagService {
  async list(conditions: any = {}): Promise<TagModel[]> {
    const posts = await Model.find(conditions);

    console.log(posts);

    return posts;
  }
}
