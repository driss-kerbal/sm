#!/usr/bin/env node

/**
 * Comprehensive test suite for Student Management System
 * Tests both local and production deployments
 */

const http = require('http');
const https = require('https');

const TESTS = [
  {
    name: 'Homepage accessible',
    method: 'GET',
    path: '/',
    expectedStatus: 200,
  },
  {
    name: 'Login page accessible',
    method: 'GET',
    path: '/login',
    expectedStatus: 200,
  },
  {
    name: 'Setup endpoint available',
    method: 'POST',
    path: '/api/setup',
    expectedStatus: [200, 201],
  },
  {
    name: 'Students API requires authentication',
    method: 'GET',
    path: '/api/students',
    expectedStatus: 401,
  },
];

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.port === 443 ? https : http;
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body.length > 0 ? body : null,
        });
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests(hostname, port = 3000, protocol = 'http') {
  console.log(`\n🧪 Running tests on ${protocol}://${hostname}:${port}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of TESTS) {
    const options = {
      hostname,
      port,
      path: test.path,
      method: test.method,
      headers: { 'Content-Type': 'application/json' },
    };

    try {
      const result = await makeRequest(options);
      const expectedStatuses = Array.isArray(test.expectedStatus)
        ? test.expectedStatus
        : [test.expectedStatus];

      if (expectedStatuses.includes(result.status)) {
        console.log(`✅ ${test.name} (${result.status})`);
        passed++;
      } else {
        console.log(
          `❌ ${test.name} (expected ${expectedStatuses.join(' or ')}, got ${result.status})`
        );
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

async function main() {
  const args = process.argv.slice(2);
  let hostname = 'localhost';
  let port = 3000;
  let protocol = 'http';

  if (args[0]) {
    hostname = args[0];
    protocol = hostname.includes('https') ? 'https' : 'http';
    hostname = hostname.replace('https://', '').replace('http://', '');
  }

  if (args[1]) {
    port = parseInt(args[1], 10);
  }

  try {
    const success = await runTests(hostname, port, protocol);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Test suite error:', error.message);
    process.exit(1);
  }
}

main();
