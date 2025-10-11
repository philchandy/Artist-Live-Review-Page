// db/seed.js
import dotenv from 'dotenv';
import { connectDB, getDB } from './connection.js';
import bcrypt from 'bcrypt';

dotenv.config();
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    await connectDB();
    const db = getDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('artists').deleteMany({});
    await db.collection('reviews').deleteMany({});

    // Read JSON files from Mockaroo
    console.log('📖 Reading Mockaroo data files...');
    const usersData = JSON.parse(readFileSync(join(__dirname, 'data/users.json'), 'utf-8'));
    const artistsData = JSON.parse(readFileSync(join(__dirname, 'data/artists.json'), 'utf-8'));
    const reviewsData = JSON.parse(readFileSync(join(__dirname, 'data/reviews.json'), 'utf-8'));

    // Insert users with hashed passwords
    console.log('👥 Inserting users...');
    const usersToInsert = await Promise.all(
      usersData.map(async (user) => ({
        username: user.username,
        email: user.email,
        password: await bcrypt.hash(user.password || 'password123', 10),
        role: user.role || 'user',
        createdAt: new Date()
      }))
    );
    const userResult = await db.collection('users').insertMany(usersToInsert);
    const userIds = Object.values(userResult.insertedIds);
    console.log(`✅ Inserted ${userIds.length} users`);

    // Insert artists
    console.log('🎤 Inserting artists...');
    const artistsToInsert = artistsData.map((artist) => ({
      name: artist.name,
      genre: artist.genre || 'Unknown',
      bio: artist.bio || '',
      image: artist.image || '',
      createdAt: new Date()
    }));
    const artistResult = await db.collection('artists').insertMany(artistsToInsert);
    const artistIds = Object.values(artistResult.insertedIds);
    console.log(`✅ Inserted ${artistIds.length} artists`);

    // Insert reviews with mapped IDs
    console.log('⭐ Inserting reviews...');
    const reviewsToInsert = reviewsData.map((review) => {
      const artistIndex = (review.artistId || 1) - 1;
      const userIndex = (review.userId || 1) - 1;
      
      return {
        artistId: artistIds[artistIndex % artistIds.length].toString(),
        userId: userIds[userIndex % userIds.length].toString(),
        username: usersToInsert[userIndex % usersToInsert.length].username,
        rating: parseInt(review.rating) || 5,
        comment: review.comment || 'Great performance!',
        venue: review.venue || 'Unknown Venue',
        concertDate: new Date(review.concertDate || new Date()),
        createdAt: new Date()
      };
    });
    const reviewResult = await db.collection('reviews').insertMany(reviewsToInsert);
    console.log(`✅ Inserted ${reviewResult.insertedCount} reviews`);

    // Summary
    console.log('\n📊 Seeding Summary:');
    console.log(`   Users: ${userIds.length}`);
    console.log(`   Artists: ${artistIds.length}`);
    console.log(`   Reviews: ${reviewResult.insertedCount}`);
    console.log(`   Total Records: ${userIds.length + artistIds.length + reviewResult.insertedCount}`);
    console.log('\n✅ Database seeding complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
