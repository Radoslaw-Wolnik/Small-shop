// models/DefaultAudioSample.ts
import { AudioSample, IAudioSampleDocument } from './audio-sample.model';
import mongoose, { Schema, Document } from 'mongoose';


interface IDefaultAudioSampleDocument extends IAudioSampleDocument {
  forMainPage: boolean;
}

const DefaultAudioSampleSchema = new Schema<IDefaultAudioSampleDocument>({
  forMainPage: { 
    type: Boolean, 
    default: false,
    required: [true, 'forMainPage flag is required for default audio samples']
  }
});

const DefaultAudioSample = AudioSample.discriminator<IDefaultAudioSampleDocument>('DefaultAudioSample', DefaultAudioSampleSchema);

export default DefaultAudioSample;