import type { FastifyPluginAsync } from 'fastify';

import { authRoutes } from './routes/authRoutes';

export const api: FastifyPluginAsync = async (app) => {
  await app.register(authRoutes);
};
