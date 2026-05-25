const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function cleanDatabase() {
  if (!process.env.MONGO_URI) {
    console.error('[CleanDB] MONGO_URI is not set in environment variables.');
    process.exit(1);
  }

  console.log(`[CleanDB] Connecting to MongoDB: ${process.env.MONGO_URI}`);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[CleanDB] MongoDB connection established.');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);
    console.log('[CleanDB] Existing collections:', collectionNames);

    // Drop users collection if it exists
    if (collectionNames.includes('users')) {
      console.log('[CleanDB] Dropping legacy "users" collection...');
      await mongoose.connection.db.dropCollection('users');
      console.log('[CleanDB] "users" collection dropped successfully.');
    } else {
      console.log('[CleanDB] No "users" collection found. Skipping.');
    }

    // Drop feedbacks collection if it exists
    if (collectionNames.includes('feedbacks')) {
      console.log('[CleanDB] Dropping legacy "feedbacks" collection...');
      await mongoose.connection.db.dropCollection('feedbacks');
      console.log('[CleanDB] "feedbacks" collection dropped successfully.');
    } else {
      console.log('[CleanDB] No "feedbacks" collection found. Skipping.');
    }

    console.log('[CleanDB] Legacy schemas purged successfully. Ready for fresh onboarding!');
  } catch (err) {
    console.error('[CleanDB] Error during cleansing operations:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('[CleanDB] Mongoose connection closed.');
    process.exit(0);
  }
}

cleanDatabase();
