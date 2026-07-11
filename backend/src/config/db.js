const mongoose = require('mongoose');

/**
 * Establishes the MongoDB connection.
 * Fails fast on startup if the connection cannot be made, since the API
 * is useless without a database — this avoids serving requests against
 * a dead connection.
 */
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`[db] MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[db] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[db] MongoDB disconnected');
    });
  } catch (error) {
    console.error(`[db] Initial connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
