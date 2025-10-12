const axios = require('axios');

async function testChatRoutes() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('🧪 Testing Eva Chat Routes...');
  console.log('==============================\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', health.data.status);

    // Test 2: Chat test endpoint
    console.log('\n2. Testing chat test endpoint...');
    const chatTest = await axios.get(`${baseURL}/chat/test`);
    console.log('✅ Chat test:', chatTest.data.message);

    // Test 3: Chat history (should return empty or create initial)
    console.log('\n3. Testing chat history...');
    try {
      const history = await axios.get(`${baseURL}/chat/history/gaston`);
      console.log('✅ Chat history loaded:', history.data.conversations?.length || 0, 'conversations');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️  No chat history found (normal for new user)');
      } else {
        console.log('❌ Chat history error:', error.message);
      }
    }

    // Test 4: Send a test message
    console.log('\n4. Testing message sending...');
    const testMessage = {
      message: 'Hello Eva, this is a test message',
      userId: 'gaston'
    };

    const response = await axios.post(`${baseURL}/chat/message`, testMessage);
    console.log('✅ Message sent successfully!');
    console.log('📝 Eva response preview:', response.data.response?.substring(0, 100) + '...');

    console.log('\n🎉 All chat routes are working!');
    console.log('💬 You should now be able to talk to Eva!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running: npm start');
    } else if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📝 Error:', error.response.data);
    }
  }
}

if (require.main === module) {
  testChatRoutes();
}

module.exports = testChatRoutes;