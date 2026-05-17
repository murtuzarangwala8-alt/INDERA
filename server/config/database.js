import mongoose from 'mongoose';

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop the phone_1 index if it exists, to fix the Google OAuth E11000 duplicate key error
    try {
      const usersCollection = conn.connection.db.collection('users');
      const indexes = await usersCollection.indexes();
      const hasPhoneIndex = indexes.some(idx => idx.name === 'phone_1');
      if (hasPhoneIndex) {
        await usersCollection.dropIndex('phone_1');
        console.log('Successfully dropped the duplicate "phone_1" index from the users collection.');
      }

      const emailIndex = indexes.find(idx => idx.name === 'email_1');
      if (emailIndex && !emailIndex.sparse) {
        await usersCollection.dropIndex('email_1');
        await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
        console.log('Rebuilt "email_1" as a sparse unique index for phone-first accounts.');
      }
    } catch (indexError) {
      console.warn('Could not update users indexes:', indexError.message);
    }

    return conn;
  } catch (error) {
    cachedConnection = null;
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
