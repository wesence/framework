import Model, { PostModel } from './Model';

export class PostService {
  async list(conditions: any = {}): Promise<PostModel[]> {
    const posts = await Model.find(conditions);

    console.log(posts);

    return posts;
  }
}
