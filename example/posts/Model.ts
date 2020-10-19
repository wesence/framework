import mongoose from 'mongoose';
import { Post } from './graphql/types';

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 128,
    },

    tags: {
      type: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
      default: [],
    },
  },
  { strict: true },
);

export type PostModel = Post & mongoose.Document;

export default mongoose.model<PostModel>('Post', schema);
