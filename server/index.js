import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import connectDB from './config/database.js';

// Always load .env from the server/ directory, regardless of where node is launched from
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '.env') });

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
