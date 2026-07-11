import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import configRoutes from './routes/configRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import packRoutes from './routes/packRoutes';
import uploadRoutes from './routes/uploadRoutes';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api', configRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/packs', packRoutes);
app.use('/api/', uploadRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Dunia E-Pharma API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});