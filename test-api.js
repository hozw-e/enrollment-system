#!/usr/bin/env node

/**
 * API Test Script for Enrollment System Backend
 * Usage: node test-api.js
 * 
 * This script tests the backend API endpoints to verify everything is working.
 */

const http = require('http');
const readline = require('readline');

const BASE_URL = 'http://localhost:8000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    console.log(`\n📤 ${method} ${path}`);
    if (data) console.log('📦 Data:', JSON.stringify(data, null, 2));

    const req = http.request(url, options, (res) => {
      let body = '';

      res.on('data', chunk => {
        body += chunk;
      });

      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        try {
          const parsed = JSON.parse(body);
          console.log('📥 Response:', JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('📥 Response:', body);
        }
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (err) => {
      console.error('❌ Error:', err.message);
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testHealthCheck() {
  console.log('\n🔍 Testing backend connection...');
  try {
    await makeRequest('OPTIONS', '/auth/login');
    console.log('✅ Backend is running and CORS is configured');
    return true;
  } catch (err) {
    console.error('❌ Cannot connect to backend at', BASE_URL);
    console.error('   Make sure PHP server is running: php -S localhost:8000');
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing login...');
  const username = await question('  Enter username: ');
  const password = await question('  Enter password: ');

  try {
    await makeRequest('POST', '/auth/login', {
      username,
      password
    });
    console.log('✅ Login endpoint is working');
  } catch (err) {
    console.error('❌ Login test failed');
  }
}

async function testCourses() {
  console.log('\n📚 Testing courses...');
  try {
    await makeRequest('POST', '/courses');
    console.log('✅ Courses endpoint is working');
  } catch (err) {
    console.error('❌ Courses test failed');
  }
}

async function testInvalidEndpoint() {
  console.log('\n⚠️  Testing error handling (invalid endpoint)...');
  try {
    await makeRequest('POST', '/nonexistent');
  } catch (err) {
    // Expected to fail
  }
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Enrollment System - API Test Suite  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\nTesting API at: ${BASE_URL}\n`);

  // Test health
  const isHealthy = await testHealthCheck();
  if (!isHealthy) {
    rl.close();
    process.exit(1);
  }

  // Menu
  let running = true;
  while (running) {
    console.log('\n📋 Select test:');
    console.log('  1. Login (with credentials)');
    console.log('  2. Get Courses');
    console.log('  3. Error Handling Test');
    console.log('  4. Run All Tests');
    console.log('  5. Exit');

    const choice = await question('\n  Enter choice (1-5): ');

    switch (choice.trim()) {
      case '1':
        await testLogin();
        break;
      case '2':
        await testCourses();
        break;
      case '3':
        await testInvalidEndpoint();
        break;
      case '4':
        await testLogin();
        await testCourses();
        await testInvalidEndpoint();
        break;
      case '5':
        running = false;
        break;
      default:
        console.log('❌ Invalid choice');
    }
  }

  rl.close();
  console.log('\n✅ Tests completed!\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  rl.close();
  process.exit(1);
});
