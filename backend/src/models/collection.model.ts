// models/Collection.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

interface ICollectionDocument extends Document {
  user: Types.ObjectId;
  name: string;
  samples: Types.ObjectId[];
}

const CollectionSchema = new Schema<ICollectionDocument>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: [true, 'Collection name is required'],
    trim: true,
    minlength: [2, 'Collection name must be at least 2 characters long'],
    maxlength: [100, 'Collection name cannot exceed 100 characters']
  },
  samples: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AudioSample',
    validate: {
      validator: async function(v: mongoose.Types.ObjectId) {
        const count = await mongoose.models.AudioSample.countDocuments({_id: v});
        return count > 0;
      },
      message: props => `Audio sample with id ${props.value} does not exist!`
    }
  }]
});

export default mongoose.model<ICollectionDocument>('Collection', CollectionSchema);