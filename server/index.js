import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ChronoLux API running on port ${PORT}`);
    console.log(`http://localhost:${PORT}/api`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
