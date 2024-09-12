// models/UserAudioSample.ts
import { AudioSample, IAudioSampleDocument } from './audio-sample.model';
import mongoose, { Schema } from 'mongoose';

interface IUserAudioSampleDocument extends IAudioSampleDocument {
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User reference is required for user audio samples']
  }
}

const UserAudioSampleSchema = new Schema<IUserAudioSampleDocument>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const UserAudioSample = AudioSample.discriminator<IUserAudioSampleDocument>('UserAudioSample', UserAudioSampleSchema);

export default UserAudioSample;