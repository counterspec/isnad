import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { indexer } from './indexer';
import { networkMiddleware } from './middleware/network';
import networksRouter from './routes/networks';
import resourcesRouter from './routes/resources';
import trustRouter from './routes/trust';
import auditorsRouter from './routes/auditors';
import statsRouter from './routes/stats';
import debugRouter from './routes/debug';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check (no network context needed)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Networks endpoint (no network middleware - lists all networks)
app.use('/api/v1/networks', networksRouter);

// Apply network middleware to all other API routes
app.use('/api/v1', networkMiddleware);

// API routes (all have network context via middleware)
app.use('/api/v1/resources', resourcesRouter);
app.use('/api/v1/trust', trustRouter);
app.use('/api/v1/auditors', auditorsRouter);
app.use('/api/v1/stats', statsRouter);
app.use('/api/v1/debug', debugRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🦞 ISNAD API running on port ${PORT}`);
  console.log(`   Health:   http://localhost:${PORT}/health`);
  console.log(`   Networks: http://localhost:${PORT}/api/v1/networks`);
  console.log(`   Stats:    http://localhost:${PORT}/api/v1/stats`);
  console.log(`   Debug:    http://localhost:${PORT}/api/v1/debug`);
  console.log(`\n   Supports: ?network=mainnet (default) or ?network=sepolia`);
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
