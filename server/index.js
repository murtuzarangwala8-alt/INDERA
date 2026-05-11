import dotenv from 'dotenv';
import connectDB from './config/database.js';

dotenv.config();

const { default: app } = await import('./app.js');

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
