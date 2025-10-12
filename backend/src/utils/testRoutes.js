const axios = require('axios');

class RouteTestHelper {
  constructor(baseURL = 'http://localhost:3001/api') { // Changed from 3000 to 3001
    this.baseURL = baseURL;
    this.testResults = [];
  }

  async testAllRoutes() {
    console.log('🧪 Testing Eva CRM Routes...');
    console.log('============================\n');

    const tests = [
      // Contact routes
      { name: 'Get Contacts', method: 'GET', path: '/crm/contacts' },
      { name: 'Get Contact Analytics', method: 'GET', path: '/crm/contacts/analytics/overview' },
      
      // Task routes
      { name: 'Get Tasks', method: 'GET', path: '/crm/tasks' },
      { name: 'Get Task Analytics', method: 'GET', path: '/crm/tasks/analytics/productivity' },
      
      // Project routes
      { name: 'Get Projects', method: 'GET', path: '/crm/projects' },
      { name: 'Get Project Analytics', method: 'GET', path: '/crm/projects/analytics/overview' },
      
      // Note routes
      { name: 'Get Notes', method: 'GET', path: '/crm/notes' },
      
      // Analytics
      { name: 'Dashboard Analytics', method: 'GET', path: '/crm/analytics/dashboard' },
      { name: 'Search All', method: 'GET', path: '/crm/search?q=test' },
      
      // Chat route
      { name: 'Chat Message', method: 'GET', path: '/chat/history' }
    ];

    for (const test of tests) {
      await this.runTest(test);
    }

    this.printResults();
    return this.testResults;
  }

  async runTest(test) {
    try {
      const url = `${this.baseURL}${test.path}`;
      console.log(`🔍 Testing: ${test.name}`);
      console.log(`   ${test.method} ${url}`);

      const startTime = Date.now();
      
      const response = await axios({
        method: test.method,
        url,
        timeout: 10000,
        validateStatus: () => true // Don't throw on any status
      });

      const duration = Date.now() - startTime;

      const result = {
        name: test.name,
        method: test.method,
        path: test.path,
        status: response.status,
        success: response.status >= 200 && response.status < 300,
        duration,
        dataReceived: response.data ? JSON.stringify(response.data).length : 0,
        error: response.status >= 400 ? response.data?.error || 'Unknown error' : null
      };

      this.testResults.push(result);

      if (result.success) {
        console.log(`   ✅ Success (${result.duration}ms) - ${result.dataReceived} bytes`);
      } else {
        console.log(`   ❌ Failed (${result.status}) - ${result.error}`);
      }

    } catch (error) {
      console.log(`   💥 Error: ${error.message}`);
      
      this.testResults.push({
        name: test.name,
        method: test.method,
        path: test.path,
        success: false,
        error: error.message,
        duration: 0
      });
    }

    console.log('');
  }

  printResults() {
    console.log('📊 Test Results Summary');
    console.log('======================');
    
    const successful = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    const avgDuration = this.testResults
      .filter(r => r.duration > 0)
      .reduce((sum, r) => sum + r.duration, 0) / this.testResults.length;

    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚡ Average Response Time: ${Math.round(avgDuration)}ms`);
    console.log(`📊 Success Rate: ${Math.round((successful / this.testResults.length) * 100)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   - ${r.name}: ${r.error}`);
        });
    }

    console.log('\n🎯 Route Testing Complete!');
  }

  // Create sample data for testing
  async createSampleData() {
    console.log('📝 Creating sample data for testing...');

    const sampleContact = {
      userId: 'gaston',
      name: 'John Doe',
      company: 'Tech Corp',
      email: 'john@techcorp.com',
      relationships: {
        type: 'client',
        importance: 'high'
      }
    };

    const sampleTask = {
      userId: 'gaston',
      title: 'Review project proposal',
      description: 'Review and provide feedback on the new project proposal',
      priority: 'high',
      status: 'pending'
    };

    const sampleNote = {
      userId: 'gaston',
      title: 'Meeting Notes',
      content: 'Discussed project timeline and requirements with the team.',
      type: 'meeting',
      category: 'work'
    };

    try {
      // Create sample data
      await Promise.all([
        axios.post(`${this.baseURL}/crm/contacts`, sampleContact),
        axios.post(`${this.baseURL}/crm/tasks`, sampleTask),
        axios.post(`${this.baseURL}/crm/notes`, sampleNote)
      ]);

      console.log('✅ Sample data created successfully');
      return true;

    } catch (error) {
      console.log('❌ Failed to create sample data:', error.message);
      return false;
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  async function runTests() {
    const tester = new RouteTestHelper();
    
    // Create sample data first
    await tester.createSampleData();
    
    // Wait a moment for data to be saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Run all tests
    await tester.testAllRoutes();
  }

  runTests();
}

module.exports = RouteTestHelper;