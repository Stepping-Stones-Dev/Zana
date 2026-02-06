import 'dotenv/config';

import cors from '@fastify/cors';
import Fastify from 'fastify';

import { authPlugin } from './auth';
import { api } from './http/api';
import { errorHandlingPlugin } from './http/plugins/errorHandling';
import { healthRoutes } from './http/routes/healthRoutes';

const PORT = Number(process.env.PORT ?? 4000);

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: (origin, cb) => {
    // Allow non-browser tools (no Origin) and local dev.
    if (!origin) return cb(null, true);
    if (origin === 'http://localhost:5173') return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
});

// Register error handling before auth/routes so all failures are normalized.
await app.register(errorHandlingPlugin);

await app.register(authPlugin);

await app.register(healthRoutes);
await app.register(api, { prefix: '/api' });

await app.listen({ port: PORT, host: '0.0.0.0' });
