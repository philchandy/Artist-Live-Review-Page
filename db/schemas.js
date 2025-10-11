// Database schemas for validation and reference

// user db schema
export const userSchema = {
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Will be hashed
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  createdAt: { type: Date, default: Date.now },
};

// artist db schema
export const artistSchema = {
  name: { type: String, required: true },
  genre: { type: String, required: true },
  bio: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
};

// review form db schema
export const reviewSchema = {
  artistId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  venue: { type: String, required: true },
  concertDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
};
