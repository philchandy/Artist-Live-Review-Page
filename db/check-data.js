// db/check-data.js - Verify database has 1000+ records
import dotenv from 'dotenv';
import { connectDB, getDB } from './connection.js';

dotenv.config();

async function checkData() {
  try {
    await connectDB();
    const db = getDB();

    const userCount = await db.collection('users').countDocuments();
    const artistCount = await db.collection('artists').countDocuments();
    const reviewCount = await db.collection('reviews').countDocuments();
    const totalCount = userCount + artistCount + reviewCount;

    console.log('\n📊 Database Record Count:');
    console.log('─────────────────────────');
    console.log(`👥 Users:    ${userCount}`);
    console.log(`🎤 Artists:  ${artistCount}`);
    console.log(`⭐ Reviews:  ${reviewCount}`);
    console.log('─────────────────────────');
    console.log(`📦 TOTAL:    ${totalCount}`);
    console.log('─────────────────────────\n');

    if (totalCount >= 1000) {
      console.log(
        '✅ PASS: Database has 1,000+ records (Rubric requirement met)'
      );
    } else {
      console.log(
        `❌ FAIL: Database has only ${totalCount} records (Need 1,000+)`
      );
    }

    // Show sample data
    console.log('\n📋 Sample Data:');
    const sampleArtist = await db.collection('artists').findOne();
    const sampleReview = await db.collection('reviews').findOne();

    if (sampleArtist) {
      console.log('\n🎤 Sample Artist:');
      console.log(`   Name: ${sampleArtist.name}`);
      console.log(`   Genre: ${sampleArtist.genre}`);
    }

    if (sampleReview) {
      console.log('\n⭐ Sample Review:');
      console.log(`   Rating: ${sampleReview.rating}/5`);
      console.log(`   Venue: ${sampleReview.venue}`);
      console.log(`   Comment: ${sampleReview.comment.substring(0, 50)}...`);
    }

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking data:', error);
    process.exit(1);
  }
}

checkData();
