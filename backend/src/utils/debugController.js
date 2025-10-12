try {
  console.log('🔍 Debugging ChatController...');
  
  const imported = require('../controllers/chatController');
  
  console.log('📊 Import type:', typeof imported);
  console.log('📊 Is constructor:', typeof imported === 'function');
  console.log('📊 Is instance:', typeof imported === 'object');
  
  if (typeof imported === 'function') {
    console.log('📊 Creating instance...');
    const instance = new imported();
    console.log('✅ Methods available:');
    console.log('   - handleMessage:', typeof instance.handleMessage === 'function');
    console.log('   - sendMessage:', typeof instance.sendMessage === 'function');
  } else if (typeof imported === 'object') {
    console.log('✅ Methods available:');
    console.log('   - handleMessage:', typeof imported.handleMessage === 'function');
    console.log('   - sendMessage:', typeof imported.sendMessage === 'function');
  }
  
} catch (error) {
  console.error('❌ Debug error:', error);
}