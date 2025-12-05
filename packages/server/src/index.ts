import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { productRoutes } from './routes/products';
import { userRoutes } from './routes/users';
import { storeRoutes } from './routes/stores';
import authRoutes from './routes/auth';
import { orderRoutes } from './routes/orders';
import healthRoutes from './routes/health';
import { errorHandler } from './middleware/error';
import { requestLogger } from './middleware/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check routes
app.use('/', healthRoutes);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/orders', orderRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});