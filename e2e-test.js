#!/usr/bin/env node

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = { email: 'seller@vyeya.com', password: 'password' };

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({ status: res.statusCode, data });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  const response = await makeRequest('GET', '/health');
  
  if (response.status === 200 && response.data.status === 'OK') {
    console.log('✅ Health check passed');
    return true;
  } else {
    console.log('❌ Health check failed:', response);
    return false;
  }
}

async function testLogin() {
  console.log('🔍 Testing login...');
  const response = await makeRequest('POST', '/api/v1/auth/login', TEST_USER);
  
  if (response.status === 200 && response.data.token) {
    console.log('✅ Login successful');
    return response.data.token;
  } else {
    console.log('❌ Login failed:', response);
    return null;
  }
}

async function testProducts() {
  console.log('🔍 Testing products API...');
  const response = await makeRequest('GET', '/api/v1/products');
  
  if (response.status === 200 && response.data.products && response.data.products.length > 0) {
    const product = response.data.products[0];
    if (product.userId) {
      console.log('✅ Products API working, userId field present');
      return product;
    } else {
      console.log('❌ Products missing userId field:', product);
      return null;
    }
  } else {
    console.log('❌ Products API failed:', response);
    return null;
  }
}

async function testGrowerProfile(userId) {
  console.log('🔍 Testing grower profile API...');
  const response = await makeRequest('GET', `/api/v1/auth/grower/${userId}`);
  
  if (response.status === 200 && response.data.grower) {
    const grower = response.data.grower;
    if (grower.name && grower.bio && grower.phone && grower.location) {
      console.log('✅ Grower profile complete:', grower.name);
      return grower;
    } else {
      console.log('❌ Grower profile incomplete:', grower);
      return null;
    }
  } else {
    console.log('❌ Grower profile API failed:', response);
    return null;
  }
}

async function testProductDetails(productId) {
  console.log('🔍 Testing product details API...');
  const response = await makeRequest('GET', `/api/v1/products/${productId}`);
  
  if (response.status === 200 && response.data.product) {
    console.log('✅ Product details API working');
    return response.data.product;
  } else {
    console.log('❌ Product details API failed:', response);
    return null;
  }
}

// Main test runner
async function runE2ETests() {
  console.log('🚀 Starting End-to-End Tests for Vyeya Producer-to-Consumer Marketplace\n');
  
  let passed = 0;
  let failed = 0;
  
  try {
    // Test 1: Health Check
    if (await testHealthCheck()) passed++; else failed++;
    
    // Test 2: Login
    const token = await testLogin();
    if (token) passed++; else failed++;
    
    // Test 3: Products API
    const product = await testProducts();
    if (product) passed++; else failed++;
    
    // Test 4: Grower Profile API
    if (product && product.userId) {
      const grower = await testGrowerProfile(product.userId);
      if (grower) passed++; else failed++;
      
      // Test 5: Product Details API
      const productDetails = await testProductDetails(product.id);
      if (productDetails) passed++; else failed++;
    } else {
      failed += 2;
    }
    
  } catch (error) {
    console.log('❌ Test suite failed with error:', error.message);
    failed++;
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The producer-to-consumer marketplace is working correctly.');
    console.log('\n📱 Ready to test mobile app flow:');
    console.log('1. Login with: seller@vyeya.com / password');
    console.log('2. Browse products');
    console.log('3. Click product → View Grower Profile');
    console.log('4. See complete grower information');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
  
  process.exit(failed === 0 ? 0 : 1);
}

// Wait for server to start then run tests
setTimeout(runE2ETests, 3000);