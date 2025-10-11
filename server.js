// server.js
import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { connectDB, getDB } from './db/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  })
);

// Connect to MongoDB
await connectDB();

/* ===============================
   AUTH MIDDLEWARE
================================= */
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/* ===============================
   AUTH ROUTES
================================= */
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const db = getDB();

    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const existingUser = await db
      .collection('users')
      .findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
    });

    req.session.userId = result.insertedId.toString();
    req.session.username = username;
    req.session.role = 'user';

    res.json({
      success: true,
      user: {
        id: result.insertedId.toString(),
        username,
        email,
        role: 'user',
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: 'Invalid credentials' });

    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.role = user.role;

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ success: true });
  });
});

app.get('/api/me', (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: 'Not authenticated' });
  res.json({
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role,
  });
});

/* ===============================
   ARTISTS + REVIEWS
================================= */
app.get('/api/artists', async (req, res) => {
  try {
    const db = getDB();
    const artists = await db.collection('artists').find().toArray();
    const reviews = await db.collection('reviews').find().toArray();

    const ratingMap = reviews.reduce((acc, r) => {
      acc[r.artistId] = acc[r.artistId] || [];
      acc[r.artistId].push(r.rating);
      return acc;
    }, {});

    const artistsWithRatings = artists.map((a) => ({
      ...a,
      avgRating: ratingMap[a._id]
        ? ratingMap[a._id].reduce((x, y) => x + y, 0) / ratingMap[a._id].length
        : null,
    }));

    res.json(artistsWithRatings);
  } catch (err) {
    console.error('Error fetching artists:', err);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

app.get('/api/artists/:id', async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = await import('mongodb');
    const artist = await db
      .collection('artists')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    console.error('Error fetching artist:', err);
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

app.get('/api/artists/:id/reviews', async (req, res) => {
  try {
    const db = getDB();
    const reviews = await db
      .collection('reviews')
      .find({ artistId: req.params.id })
      .toArray();
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/* ===============================
   SEARCH (with avgRating)
================================= */
app.get('/api/search', async (req, res) => {
  try {
    const db = getDB();
    const { q } = req.query;

    let query = {};
    if (q && q.trim() !== '') {
      query = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { genre: { $regex: q, $options: 'i' } },
        ],
      };
    }

    const artists = await db.collection('artists').find(query).toArray();
    const reviews = await db.collection('reviews').find().toArray();

    // Calculate average ratings
    const ratingMap = reviews.reduce((acc, r) => {
      acc[r.artistId] = acc[r.artistId] || [];
      acc[r.artistId].push(r.rating);
      return acc;
    }, {});

    const artistsWithRatings = artists.map((a) => ({
      ...a,
      avgRating: ratingMap[a._id?.toString()]
        ? ratingMap[a._id.toString()].reduce((x, y) => x + y, 0) /
          ratingMap[a._id.toString()].length
        : null,
    }));

    res.json(artistsWithRatings);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

/* ===============================
   USER ROUTES
================================= */
app.get('/api/my-reviews', requireAuth, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = await import('mongodb');
    const reviews = await db.collection('reviews').find({ userId: req.session.userId }).toArray();
    
    const reviewsWithArtists = await Promise.all(
      reviews.map(async (review) => {
        const artist = await db.collection('artists').findOne({ _id: new ObjectId(review.artistId) });
        return { ...review, artistName: artist?.name || 'Unknown Artist' };
      })
    );
    
    res.json(reviewsWithArtists);
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/* ===============================
   ADMIN ROUTES
================================= */
app.get('/api/admin/reviews', requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const reviews = await db.collection('reviews').find().toArray();
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching all reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.put('/api/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = await import('mongodb');
    const { comment, rating, venue } = req.body;

    if (!comment || !rating || !venue) {
      return res.status(400).json({ error: 'Comment, rating, and venue are required' });
    }

    const result = await db.collection('reviews').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          comment: comment.trim(), 
          rating: parseInt(rating, 10),
          venue: venue.trim(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ success: true, message: 'Review updated successfully' });
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

app.delete('/api/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { ObjectId } = await import('mongodb');

    const result = await db.collection('reviews').deleteOne(
      { _id: new ObjectId(req.params.id) }
    );

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

/* ===============================
   CREATE REVIEW (auto-create artist)
================================= */
app.post('/api/reviews', async (req, res) => {
  try {
    const db = getDB();
    const {
      artistName,
      rating,
      comment,
      venue,
      concertDate,
      userId,
      username,
    } = req.body;

    console.log('📩 Review payload:', req.body);

    if (
      !artistName?.trim() ||
      !rating ||
      !comment?.trim() ||
      !venue?.trim() ||
      !concertDate ||
      !userId ||
      !username
    )
      return res.status(400).json({ error: 'All fields are required.' });

    const dateObj = new Date(concertDate);
    if (isNaN(dateObj.getTime()))
      return res.status(400).json({ error: 'Invalid concert date format.' });

    let artist = await db
      .collection('artists')
      .findOne({ name: artistName.trim() });
    if (!artist) {
      const newArtist = {
        name: artistName.trim(),
        genre: 'Unknown',
        bio: '',
        image: '',
        createdAt: new Date(),
      };
      const result = await db.collection('artists').insertOne(newArtist);
      artist = { ...newArtist, _id: result.insertedId };
    }

    const review = {
      artistId: artist._id.toString(),
      userId,
      username,
      rating: parseInt(rating, 10),
      comment: comment.trim(),
      venue: venue.trim(),
      concertDate: dateObj,
      createdAt: new Date(),
    };

    await db.collection('reviews').insertOne(review);
    console.log('✅ Review added:', review);

    res.json({ success: true, message: `Review for ${artist.name} added!` });
  } catch (err) {
    console.error('💥 Error submitting review:', err);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

/* ===============================
   SPA FALLBACK
================================= */
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

/* ===============================
   START SERVER
================================= */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export { requireAuth };
