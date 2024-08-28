// models/Collection.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

interface ICollectionDocument extends Document {
  user: Types.ObjectId;
  name: string;
  samples: Types.ObjectId[];
}

const CollectionSchema = new Schema<ICollectionDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  samples: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AudioSample' }]
});

export default mongoose.model<ICollectionDocument>('Collection', CollectionSchema);