jest.mock('../models/Product');
jest.mock('../middleware/auth', () => ({
  ...jest.requireActual('../middleware/auth'),
  authenticateToken: jest.fn(async (req, _res, next) => {
    req.user = { id: 'u1', email: 'test@example.com', role: 'user', name: 'Test User' };
    next();
  })
}));
import request from 'supertest';
import express from 'express';




describe('Product Routes', () => {
  let app: express.Express;
  const mockProducts = [
    {
      id: '1',
      name: 'Product 1',
      price: 10,
      stock: 5,
      store_id: 's1',
      location: { lat: 0, lng: 0 },
      category_id: 'c1',
      created_at: new Date()
    },
    {
      id: '2',
      name: 'Product 2',
      price: 20,
      stock: 10,
      store_id: 's2',
      location: { lat: 1, lng: 1 },
      category_id: 'c2',
      created_at: new Date()
    }
  ];
  let ProductModel;
  beforeEach(() => {
    // Clear require cache for router and model
    jest.resetModules();
    (async () => {
      const productModule = await import('../models/Product');
      ProductModel = productModule.ProductModel;
      app = express();
      app.use(express.json());
      // Import the router after mocks are set
      const { productRoutes } = await import('../routes/products');
      app.use('/api/v1/products', productRoutes);
    })();
  });
  afterEach(() => jest.clearAllMocks());

  describe('GET /api/v1/products', () => {
    it('should return all products', async () => {
      (ProductModel.findAll as jest.Mock).mockResolvedValue(mockProducts);
      const res = await request(app).get('/api/v1/products');
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(2);
      expect(res.body.total).toBe(2);
    });
    it('should handle db error', async () => {
      (ProductModel.findAll as jest.Mock).mockRejectedValue(new Error('fail'));
      const res = await request(app).get('/api/v1/products');
      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/products/search', () => {
    it('should return 400 if no query', async () => {
      const res = await request(app).get('/api/v1/products/search');
      expect(res.status).toBe(400);
    });
    it('should return search results', async () => {
      (ProductModel.search as jest.Mock).mockResolvedValue([mockProducts[0]]);
      const res = await request(app).get('/api/v1/products/search?q=Product');
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
    });
    it('should handle search error', async () => {
      (ProductModel.search as jest.Mock).mockRejectedValue(new Error('fail'));
      const res = await request(app).get('/api/v1/products/search?q=Product');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return a product by id', async () => {
      (ProductModel.findById as jest.Mock).mockResolvedValue(mockProducts[0]);
      const res = await request(app).get('/api/v1/products/1');
      expect(res.status).toBe(200);
      expect(res.body.product).toBeDefined();
    });
    it('should return 404 if not found', async () => {
      (ProductModel.findById as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get('/api/v1/products/999');
      expect(res.status).toBe(404);
    });
    it('should handle db error', async () => {
      (ProductModel.findById as jest.Mock).mockRejectedValue(new Error('fail'));
      const res = await request(app).get('/api/v1/products/1');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/v1/products/my', () => {
    it('should return user products', async () => {
      (ProductModel.findByUserId as jest.Mock).mockResolvedValue([mockProducts[0]]);
      const res = await request(app).get('/api/v1/products/my');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe('1');
      expect(res.body[0].name).toBe('Product 1');
    });
    it('should handle db error', async () => {
      (ProductModel.findByUserId as jest.Mock).mockRejectedValue(new Error('fail'));
      const res = await request(app).get('/api/v1/products/my');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create a product', async () => {
      (ProductModel.create as jest.Mock).mockResolvedValue(mockProducts[0]);
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Product 1', price: 10, stock: 5, store_id: 's1', category_id: 'c1' });
      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
    });
    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Product 1', price: 10 });
      expect(res.status).toBe(400);
    });
    it('should handle db error', async () => {
      (ProductModel.create as jest.Mock).mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Product 1', price: 10, stock: 5, store_id: 's1', category_id: 'c1' });
      expect(res.status).toBe(500);
    });
  });

  describe('Error logging in non-test environments', () => {
    it('should log database errors in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      ProductModel.findAll.mockRejectedValue(new Error('Database connection failed'));

      await request(app)
        .get('/api/v1/products');

      expect(consoleSpy).toHaveBeenCalledWith('Database error:', expect.any(Error));
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });
});


