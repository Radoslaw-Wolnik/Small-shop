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
  name: String,
  audioUrl: String,
  iconUrl: String,
  createdAt: { type: Date, default: Date.now }
}, { discriminatorKey: 'sampleType' });

export const AudioSample = mongoose.model<IAudioSampleDocument>('AudioSample', AudioSampleSchema);