import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { productRoutes } from './routes/products';
import { userRoutes } from './routes/users';
import { storeRoutes } from './routes/stores';
import authRoutes from './routes/auth';
import { orderRoutes } from './routes/orders';
import healthRoutes from './routes/health';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check routes
app.use('/', healthRoutes);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/orders', orderRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export app for testing
export default app;

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}