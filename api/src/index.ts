import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { indexer } from './indexer';
import resourcesRouter from './routes/resources';
import trustRouter from './routes/trust';
import auditorsRouter from './routes/auditors';
import statsRouter from './routes/stats';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/resources', resourcesRouter);
app.use('/api/v1/trust', trustRouter);
app.use('/api/v1/auditors', auditorsRouter);
app.use('/api/v1/stats', statsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🦞 ISNAD API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Stats:  http://localhost:${PORT}/api/v1/stats`);
  console.log('');
});

// Start indexer in background
indexer.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await indexer.stop();
  process.exit(0);
});
