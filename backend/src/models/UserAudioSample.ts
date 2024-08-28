// models/UserAudioSample.ts
import { AudioSample, IAudioSampleDocument } from './AudioSample';
import mongoose, { Schema, Types } from 'mongoose';

interface IUserAudioSampleDocument extends IAudioSampleDocument {
  user: Types.ObjectId;
}

const UserAudioSampleSchema = new Schema<IUserAudioSampleDocument>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const UserAudioSample = AudioSample.discriminator<IUserAudioSampleDocument>('UserAudioSample', UserAudioSampleSchema);

export default UserAudioSample;