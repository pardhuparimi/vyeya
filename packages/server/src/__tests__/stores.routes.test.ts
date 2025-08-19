import request from 'supertest';
import app from '../index';

describe('Stores Routes', () => {
  describe('GET /api/v1/stores', () => {
    it('should return list of stores', async () => {
      const res = await request(app)
        .get('/api/v1/stores');

      expect(res.status).toBe(200);
      expect(res.body.stores).toBeDefined();
      expect(Array.isArray(res.body.stores)).toBe(true);
      expect(res.body.total).toBe(res.body.stores.length);
      
      if (res.body.stores.length > 0) {
        expect(res.body.stores[0]).toHaveProperty('id');
        expect(res.body.stores[0]).toHaveProperty('name');
        expect(res.body.stores[0]).toHaveProperty('type');
        expect(res.body.stores[0]).toHaveProperty('location');
        expect(res.body.stores[0]).toHaveProperty('hours');
        expect(res.body.stores[0]).toHaveProperty('verified');
      }
    });
  });

  describe('GET /api/v1/stores/:id', () => {
    it('should return a specific store by ID', async () => {
      // First, get the list of stores to get a valid ID
      const storesRes = await request(app).get('/api/v1/stores');
      
      const stores = storesRes.body.stores || storesRes.body || [];
      if (stores.length > 0) {
        const storeId = stores[0].id;
        
        const res = await request(app)
          .get(`/api/v1/stores/${storeId}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(storeId);
        expect(res.body).toHaveProperty('name');
        expect(res.body).toHaveProperty('type');
        expect(res.body).toHaveProperty('location');
        expect(res.body).toHaveProperty('hours');
        expect(res.body).toHaveProperty('verified');
      }
    });

    it('should return 404 for non-existent store', async () => {
      const res = await request(app)
        .get('/api/v1/stores/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Store not found');
    });
  });

  describe('POST /api/v1/stores', () => {
    const newStoreData = {
      user_id: '123',
      name: 'Test Store',
      type: 'Fancy',
      location: { lat: 41.8781, lng: -87.6298 },
      hours: { open: '9:00', close: '17:00' }
    };

    it('should create a new store', async () => {
      const res = await request(app)
        .post('/api/v1/stores')
        .send(newStoreData);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        user_id: newStoreData.user_id,
        name: newStoreData.name,
        type: newStoreData.type,
        location: newStoreData.location,
        hours: newStoreData.hours,
        verified: false
      });
      expect(res.body.id).toBeDefined();
    });

    it('should handle missing required fields gracefully', async () => {
      const incompleteData = {
        name: 'Incomplete Store'
      };

      const res = await request(app)
        .post('/api/v1/stores')
        .send(incompleteData);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Incomplete Store');
      expect(res.body.verified).toBe(false);
      expect(res.body.id).toBeDefined();
    });

    it('should add created store to the stores list', async () => {
      // Get initial count
      const initialRes = await request(app).get('/api/v1/stores');
      const initialCount = initialRes.body.stores.length;

      // Create new store
      const newStore = {
        user_id: '456',
        name: 'Another Test Store',
        type: 'Market',
        location: { lat: 34.0522, lng: -118.2437 },
        hours: { open: '7:00', close: '19:00' }
      };

      const createRes = await request(app)
        .post('/api/v1/stores')
        .send(newStore);

      expect(createRes.status).toBe(201);

      // Verify count increased
      const finalRes = await request(app).get('/api/v1/stores');
      expect(finalRes.body.stores.length).toBe(initialCount + 1);
      
      // Find the created store in the list
  type Store = { id: string; name: string };
  const createdStore = finalRes.body.stores.find((s: Store) => s.id === createRes.body.id);
      expect(createdStore).toBeDefined();
      expect(createdStore.name).toBe(newStore.name);
    });
  });
});
