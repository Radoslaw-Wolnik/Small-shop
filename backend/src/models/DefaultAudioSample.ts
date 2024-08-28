// models/DefaultAudioSample.ts
import { AudioSample, IAudioSampleDocument } from './AudioSample';
import mongoose, { Schema, Document } from 'mongoose';


interface IDefaultAudioSampleDocument extends IAudioSampleDocument {
  forMainPage: boolean;
}

const DefaultAudioSampleSchema = new Schema<IDefaultAudioSampleDocument>({
  forMainPage: { type: Boolean, default: false }
});

const DefaultAudioSample = AudioSample.discriminator<IDefaultAudioSampleDocument>('DefaultAudioSample', DefaultAudioSampleSchema);

export default DefaultAudioSample;