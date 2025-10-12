const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const UserContext = require('../models/UserContext');

async function inspectDatabase() {
  console.log('🔍 Inspecting Eva Database...');
  console.log('============================\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Available Collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    console.log('');

    // Check UserContext collection specifically
    console.log('🔍 UserContext Analysis:');
    console.log('========================');
    
    const allUserContexts = await UserContext.find({});
    console.log(`📊 Total UserContext documents: ${allUserContexts.length}\n`);

    if (allUserContexts.length > 0) {
      console.log('👥 Found UserContext documents:');
      allUserContexts.forEach((ctx, index) => {
        console.log(`\n📋 Document ${index + 1}:`);
        console.log(`   🆔 User ID: ${ctx.userId || 'undefined'}`);
        console.log(`   📛 Name: ${ctx.name || 'undefined'}`);
        console.log(`   👥 Contacts: ${ctx.contacts?.length || 0}`);
        console.log(`   📅 Agenda/Tasks: ${ctx.agenda?.length || 0}`);
        console.log(`   📝 Notes: ${ctx.notes?.length || 0}`);
        console.log(`   💬 Conversations: ${ctx.conversationHistory?.length || 0}`);
        console.log(`   📅 Created: ${ctx.createdAt || 'undefined'}`);
        console.log(`   🔧 Modified: ${ctx.updatedAt || 'undefined'}`);
        
        // Show available fields
        console.log(`   🔑 Available fields: ${Object.keys(ctx.toObject()).join(', ')}`);
      });

      // Show sample data structure
      console.log('\n📊 Sample Data Structure:');
      console.log('=========================');
      const sampleCtx = allUserContexts[0];
      
      if (sampleCtx.contacts && sampleCtx.contacts.length > 0) {
        console.log('\n👥 Sample Contact:');
        console.log(JSON.stringify(sampleCtx.contacts[0], null, 2));
      }
      
      if (sampleCtx.agenda && sampleCtx.agenda.length > 0) {
        console.log('\n📅 Sample Task:');
        console.log(JSON.stringify(sampleCtx.agenda[0], null, 2));
      }
      
      if (sampleCtx.conversationHistory && sampleCtx.conversationHistory.length > 0) {
        console.log('\n💬 Sample Conversation:');
        console.log(JSON.stringify(sampleCtx.conversationHistory[0], null, 2));
      }

    } else {
      console.log('❌ No UserContext documents found in database');
      console.log('\n🤔 This could mean:');
      console.log('   1. Fresh installation - no data created yet');
      console.log('   2. Different collection name');
      console.log('   3. Data is in a different format');
      
      // Check for any documents with 'gaston' in any collection
      console.log('\n🔍 Searching for "gaston" in all collections...');
      
      for (const collection of collections) {
        try {
          const db = mongoose.connection.db;
          const docs = await db.collection(collection.name).find({
            $or: [
              { userId: 'gaston' },
              { user: 'gaston' },
              { name: 'gaston' },
              { username: 'gaston' }
            ]
          }).limit(5).toArray();
          
          if (docs.length > 0) {
            console.log(`\n📂 Found ${docs.length} documents in "${collection.name}" collection:`);
            docs.forEach((doc, index) => {
              console.log(`   Document ${index + 1}: ${JSON.stringify(doc, null, 2).substring(0, 200)}...`);
            });
          }
        } catch (error) {
          // Skip collections we can't read
        }
      }
    }

  } catch (error) {
    console.error('❌ Error inspecting database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

inspectDatabase();