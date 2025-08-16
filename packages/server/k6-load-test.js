import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users over 30s
    { duration: '1m', target: 20 },  // Stay at 20 users for 1m
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
    errors: ['rate<0.1'],             // Custom error rate must be below 10%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Health check endpoint
  let response = http.get(`${BASE_URL}/health`);
  let checkResult = check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  errorRate.add(!checkResult);

  // API endpoints testing
  const endpoints = [
    '/api/products',
    '/api/categories',
    '/api/auth/status',
  ];

  endpoints.forEach(endpoint => {
    response = http.get(`${BASE_URL}${endpoint}`);
    checkResult = check(response, {
      [`${endpoint} status is 200 or 401`]: (r) => r.status === 200 || r.status === 401,
      [`${endpoint} response time < 500ms`]: (r) => r.timings.duration < 500,
    });
    
    errorRate.add(!checkResult);
    sleep(0.1); // Small delay between requests
  });

  sleep(1); // Think time between iterations
}

export function handleSummary(data) {
  return {
    'load-test-summary.json': JSON.stringify(data, null, 2),
  };
}
