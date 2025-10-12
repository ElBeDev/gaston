#!/usr/bin/env node

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const MigrationManager = require('./migrationManager');

// CLI argument parsing
const args = process.argv.slice(2);
const options = {
  userId: 'gaston',
  dryRun: false,
  backupFirst: true,
  forceOverwrite: false
};

// Parse command line arguments
args.forEach((arg, index) => {
  switch (arg) {
    case '--dry-run':
      options.dryRun = true;
      break;
    case '--no-backup':
      options.backupFirst = false;
      break;
    case '--force':
      options.forceOverwrite = true;
      break;
    case '--user':
      options.userId = args[index + 1];
      break;
  }
});

async function runMigration() {
  console.log('🚀 Eva Advanced Intelligence Migration Tool');
  console.log('==========================================');
  console.log(`👤 User ID: ${options.userId}`);
  console.log(`🧪 Dry Run: ${options.dryRun ? 'YES' : 'NO'}`);
  console.log(`💾 Backup First: ${options.backupFirst ? 'YES' : 'NO'}`);
  console.log(`💪 Force Overwrite: ${options.forceOverwrite ? 'YES' : 'NO'}`);
  console.log('==========================================\n');

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Initialize migration manager
    const migrationManager = new MigrationManager();

    // Run migration
    const result = await migrationManager.runMigration(options);

    if (result.success) {
      console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY! 🎉');
      console.log('=====================================');
      console.log('📊 Final Statistics:');
      console.table(result.stats);
      
      if (options.dryRun) {
        console.log('\n⚠️  This was a DRY RUN - no data was actually migrated.');
        console.log('Run without --dry-run to perform the actual migration.');
      } else {
        console.log('\n✅ Eva now has access to your intelligent data architecture!');
        console.log('🧠 Advanced intelligence features are now available.');
        console.log('\n🎯 Next Steps:');
        console.log('  1. Update your services to use the new schemas');
        console.log('  2. Test Eva\'s enhanced intelligence');
        console.log('  3. Enjoy the advanced features!');
      }
    } else {
      console.log('\n❌ MIGRATION FAILED');
      console.log('==================');
      console.error('Error:', result.error);
      
      if (result.errors.length > 0) {
        console.log('\n🔍 Detailed Errors:');
        result.errors.forEach(error => console.error(`  - ${error}`));
      }
    }

  } catch (error) {
    console.error('\n💥 Fatal Error:', error.message);
    console.error(error.stack);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Display help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 Eva Advanced Intelligence Migration Tool

Usage: node runMigration.js [options]

Options:
  --dry-run           Run migration simulation without changing data
  --no-backup         Skip creating backup before migration
  --force             Overwrite existing migrated data
  --user <userId>     Specify user ID to migrate (default: gaston)
  --help, -h          Show this help message

Examples:
  node runMigration.js --dry-run              # Test migration
  node runMigration.js                        # Run full migration
  node runMigration.js --force --user john    # Force migrate user 'john'
  node runMigration.js --no-backup            # Skip backup (not recommended)

🧠 This tool migrates your data from the legacy UserContext schema
   to Eva's advanced intelligent architecture with cross-referenced
   relationships and AI-powered features.
`);
  process.exit(0);
}

// Run the migration
runMigration();