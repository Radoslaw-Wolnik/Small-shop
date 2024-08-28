import express, { Express } from 'express';
import cors from 'cors';
import env from './config/environment';

import userRoutes from './routes/userRoutes';
import audioRoutes from './routes/audioRoutes';
import iconRoutes from './routes/iconRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import collectionRoutes from './routes/collectionRoutes'


const app: Express = express();

app.use(cors({
    origin: env.FRONTEND, //'https://localhost:5173' 
    credentials: true,
  }));
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/api/users', userRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/icon', iconRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/collection', collectionRoutes);

export default app;