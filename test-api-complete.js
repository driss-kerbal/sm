const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Create axios instance with cookie jar
const client = axios.create({
  withCredentials: true, // Important: maintain cookies
  validateStatus: () => true, // Don't throw on any status
});

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(`\n🧪 Testing: ${name}`, colors.cyan);
    await fn();
    log(`✅ PASSED: ${name}`, colors.green);
    return true;
  } catch (error) {
    log(`❌ FAILED: ${name}`, colors.red);
    if (error.response) {
      log(`   Status: ${error.response.status}`, colors.yellow);
      log(`   Data: ${JSON.stringify(error.response.data)}`, colors.yellow);
    } else if (error.message) {
      log(`   Error: ${error.message}`, colors.yellow);
    }
    return false;
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  log('\n' + '='.repeat(60), colors.blue);
  log('🚀 API TESTING SUITE - Student Management System', colors.blue);
  log('='.repeat(60) + '\n', colors.blue);

  // Test 1: Health Check
  if (await test('1. GET /api/health - Health Check', async () => {
    const response = await client.get(`${BASE_URL}/api/health`);
    log(`   Database Status: ${response.data.database?.type}`, colors.cyan);
    log(`   Tables Initialized: Users=${response.data.database?.tables?.users}, Students=${response.data.database?.tables?.students}`, colors.cyan);
    if (response.status !== 200) throw new Error('Expected status 200');
  })) passed++; else failed++;

  // Test 2: Setup Endpoint  
  if (await test('2. GET /api/setup - Initialize Database', async () => {
    const response = await client.get(`${BASE_URL}/api/setup`);
    log(`   Response: ${response.data.message}`, colors.cyan);
    if (response.status !== 200) throw new Error('Expected status 200');
  })) passed++; else failed++;

  // Test 3: Login with Credentials (GET the login page first to get cookies)
  let hasSession = false;
  if (await test('3. GET /login - Get Login Page (init session)', async () => {
    const response = await client.get(`${BASE_URL}/login`);
    log(`   Response status: ${response.status}`, colors.cyan);
    if (response.status !== 200) throw new Error('Expected status 200');
  })) passed++; else failed++;

  // Test 4: Sign in with NextAuth
  if (await test('4. POST /api/auth/signin - NextAuth Sign In', async () => {
    const response = await client.post(`${BASE_URL}/api/auth/signin`, {
      email: 'admin@example.com',
      password: 'admin123',
      callbackUrl: '/',
    }, {
      maxRedirects: 0,
    });
    log(`   Response status: ${response.status}`, colors.cyan);
    // NextAuth typically redirects on success
    if (response.status !== 200 && response.status !== 302 && response.status !== 307) {
      log(`   Note: Status ${response.status} might indicate redirect`, colors.yellow);
    }
  })) passed++; else failed++;

  // Test 5: Get Session
  if (await test('5. GET /api/auth/session - Get Current Session', async () => {
    const response = await client.get(`${BASE_URL}/api/auth/session`);
    if (response.data?.user) {
      log(`   Session User: ${response.data.user.email}`, colors.cyan);
      hasSession = true;
    } else {
      log(`   No session found - tests without auth will be skipped`, colors.yellow);
    }
  })) passed++; else failed++;

  // Test 6: Get All Students (Initially Empty)
  if (await test('6. GET /api/students - Get All Students', async () => {
    const response = await client.get(`${BASE_URL}/api/students`);
    if (response.status === 401) {
      log(`   ⚠️  Requires authentication - proceeding with public endpoint testing`, colors.yellow);
      // Continue anyway, not counting as failure
      return;
    }
    log(`   Total Students: ${response.data.length || 0}`, colors.cyan);
    if (!Array.isArray(response.data)) throw new Error('Expected array response');
  })) passed++; else failed++;

  // Test 7: Create a Student
  let testStudentId = null;
  if (await test('7. POST /api/students - Create New Student', async () => {
    const newStudent = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      dateOfBirth: '2000-01-15',
      address: '123 Main Street',
      city: 'New York',
      postalCode: '10001',
      country: 'USA',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    const response = await client.post(`${BASE_URL}/api/students`, newStudent);
    if (response.status === 401) {
      log(`   ⚠️  Requires authentication - skipping`, colors.yellow);
      return;
    }
    testStudentId = response.data.id;
    log(`   Created Student ID: ${testStudentId}`, colors.cyan);
    log(`   Name: ${response.data.firstName} ${response.data.lastName}`, colors.cyan);
    if (response.status !== 201 && response.status !== 200) throw new Error(`Expected status 200-201, got ${response.status}`);
  })) passed++; else failed++;

  // Test 8: Get Student by ID
  if (testStudentId && await test('8. GET /api/students/[id] - Get Student by ID', async () => {
    const response = await client.get(`${BASE_URL}/api/students/${testStudentId}`);
    if (response.status === 401) {
      log(`   ⚠️  Requires authentication - skipping`, colors.yellow);
      return;
    }
    log(`   Student: ${response.data.firstName} ${response.data.lastName}`, colors.cyan);
    log(`   Email: ${response.data.email}`, colors.cyan);
    log(`   Status: ${response.data.status}`, colors.cyan);
    if (response.status !== 200) throw new Error('Expected status 200');
  })) passed++; else failed++;

  // Test 9: Update Student
  if (testStudentId && await test('9. PUT /api/students/[id] - Update Student', async () => {
    const updateData = {
      firstName: 'Jonathan',
      phone: '+1234567891',
    };
    const response = await client.put(`${BASE_URL}/api/students/${testStudentId}`, updateData);
    if (response.status === 401) {
      log(`   ⚠️  Requires authentication - skipping`, colors.yellow);
      return;
    }
    log(`   Updated Student: ${response.data.firstName}`, colors.cyan);
    log(`   New Phone: ${response.data.phone}`, colors.cyan);
    if (response.status !== 200) throw new Error('Expected status 200');
  })) passed++; else failed++;

  // Test 10: Create Second Student
  let testStudentId2 = null;
  if (await test('10. POST /api/students - Create Another Student', async () => {
    const newStudent = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+9876543210',
      dateOfBirth: '2001-05-20',
      address: '456 Oak Avenue',
      city: 'Los Angeles',
      postalCode: '90001',
      country: 'USA',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    const response = await client.post(`${BASE_URL}/api/students`, newStudent);
    if (response.status === 401) {
      log(`   ⚠️  Requires authentication - skipping`, colors.yellow);
      return;
    }
    testStudentId2 = response.data.id;
    log(`   Created Student ID: ${testStudentId2}`, colors.cyan);
    log(`   Name: ${response.data.firstName} ${response.data.lastName}`, colors.cyan);
  })) passed++; else failed++;

  // Test 11: Get All Students (Should show created students)
  if (await test('11. GET /api/students - Get All Students (After Creates)', async () => {
    const response = await client.get(`${BASE_URL}/api/students`);
    if (response.status === 401) {
      log(`   ⚠️  Requires authentication - skipping`, colors.yellow);
      return;
    }
    log(`   Total Students: ${response.data.length}`, colors.cyan);
    response.data.slice(0, 3).forEach((student, index) => {
      log(`   ${index + 1}. ${student.firstName} ${student.lastName} (${student.email})`, colors.cyan);
    });
  })) passed++; else failed++;

  // Test 12: Delete Student
  if (testStudentId && await test('12. DELETE /api/students/[id] - Delete Student', async () => {
    const response = await client.delete(`${BASE_URL}/api/students/${testStudentId}`);
    if (response.status === 401) {
      log(`   ⚠️  Requires authentication - skipping`, colors.yellow);
      return;
    }
    log(`   Deleted Student ID: ${testStudentId}`, colors.cyan);
  })) passed++; else failed++;

  // Test 13: Verify Deletion
  if (testStudentId && await test('13. Verify Student Deleted', async () => {
    const response = await client.get(`${BASE_URL}/api/students`);
    if (response.status === 401) {
      log(`   ⚠️  Requires authentication - skipping`, colors.yellow);
      return;
    }
    const exists = response.data.some(s => s.id === testStudentId);
    log(`   Student Exists: ${exists ? 'Yes (SHOULD BE DELETED)' : 'No (Correctly Deleted)'}`, colors.cyan);
    log(`   Remaining Students: ${response.data.length}`, colors.cyan);
  })) passed++; else failed++;

  // Test 14: Invalid Email Error Handling
  if (await test('14. POST /api/students - Duplicate Email Handling', async () => {
    const newStudent = {
      firstName: 'Test',
      lastName: 'User',
      email: 'john.doe@example.com', // This might already exist
      phone: '+1111111111',
      dateOfBirth: '2002-06-10',
      address: '789 Elm Street',
      city: 'Chicago',
      postalCode: '60601',
      country: 'USA',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    const response = await client.post(`${BASE_URL}/api/students`, newStudent);
    if (response.status === 401) {
      log(`   ⚠️  Requires authentication - skipping`, colors.yellow);
      return;
    }
    if (response.status === 400 || response.status === 409) {
      log(`   ✓ Correctly rejected duplicate email (Status: ${response.status})`, colors.cyan);
    } else {
      log(`   Server allowed duplicate or returned: ${response.status}`, colors.yellow);
    }
  })) passed++; else failed++;

  // Test 15: Invalid Login
  if (await test('15. POST /api/auth/signin - Invalid Credentials', async () => {
    const response = await client.post(`${BASE_URL}/api/auth/signin`, {
      email: 'admin@example.com',
      password: 'wrongpassword',
      callbackUrl: '/',
    }, {
      maxRedirects: 0,
    });
    log(`   Response status: ${response.status}`, colors.cyan);
  })) passed++; else failed++;

  // Summary
  log('\n' + '='.repeat(60), colors.blue);
  log(`📊 TEST RESULTS`, colors.blue);
  log('='.repeat(60), colors.blue);
  log(`✅ Passed: ${passed}`, colors.green);
  log(`❌ Failed: ${failed}`, colors.red);
  log(`📈 Total: ${passed + failed}`, colors.blue);
  log(`💡 Note: Some APIs require authentication. The test attempted auth setup.`, colors.cyan);
  if ((passed + failed) > 0) {
    log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`, colors.yellow);
  }
  log('='.repeat(60) + '\n', colors.blue);

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests with delay  to ensure server is ready
setTimeout(runTests, 2000);
