import mongoose from 'mongoose';
import { Tag } from './graphql/types';

const schema = new mongoose.Schema(
  {
    name: {
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
  },
  { strict: true },
);

export type TagModel = Tag & mongoose.Document;

export default mongoose.model<TagModel>('Tag', schema);
