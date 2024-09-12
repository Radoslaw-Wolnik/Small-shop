// models/AudioSample.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAudioSampleDocument extends Document {
  name: string;
  audioUrl: string;
  iconUrl: string;
  createdAt?: Date;
  sampleType: 'DefaultAudioSample' | 'UserAudioSample';
}


const AudioSampleSchema = new Schema<IAudioSampleDocument>({
  name: { 
    type: String, 
    required: [true, 'Sample name is required'],
    trim: true,
    minlength: [2, 'Sample name must be at least 2 characters long'],
    maxlength: [100, 'Sample name cannot exceed 100 characters']
  },
  audioUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\/uploads\/audio\/(default|user)\/[\w-]+\.(mp3|wav|ogg)$/.test(v);
      },
      message: props => `${props.value} is not a valid audio URL!`
    }
  },
  iconUrl: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return /^\/uploads\/icons\/(default|user)\/[\w-]+\.png$/.test(v);
      },
      message: props => `${props.value} is not a valid icon URL!`
    }
  },
  createdAt: { type: Date, default: Date.now }
}, { discriminatorKey: 'sampleType' });

export const AudioSample = mongoose.model<IAudioSampleDocument>('AudioSample', AudioSampleSchema);