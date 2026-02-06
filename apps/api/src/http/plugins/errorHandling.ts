import type { FastifyError, FastifyPluginAsync } from 'fastify';
import { ZodError } from 'zod';

import { Prisma } from '@prisma/client';

import type { ApiErrorCode, ApiErrorResponse } from '../../contracts/errors';

type ErrorLike = {
  statusCode?: number;
  code?: unknown;
  message?: unknown;
  name?: unknown;
};

function toApiError(code: ApiErrorCode, message: string, extras?: Partial<ApiErrorResponse['error']>): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      ...extras,
    },
  };
}

function isFastifyError(err: unknown): err is FastifyError {
  return typeof err === 'object' && err !== null && 'message' in err;
}

function getRequestId(req: { id?: unknown }): string | undefined {
  return typeof req.id === 'string' ? req.id : undefined;
}

function withRequestId<T extends object>(obj: T, requestId: string | undefined): T & { requestId?: string } {
  return (requestId ? { ...obj, requestId } : obj) as T & { requestId?: string };
}

export const errorHandlingPlugin: FastifyPluginAsync = async (app) => {
  app.setNotFoundHandler(async (req, reply) => {
    const res: ApiErrorResponse = withRequestId(toApiError('NOT_FOUND', 'Route not found'), getRequestId(req));
    return reply.code(404).send(res);
  });

  app.setErrorHandler(async (err, req, reply) => {
    const requestId = getRequestId(req);

    // Zod validation
    if (err instanceof ZodError) {
      const res: ApiErrorResponse = withRequestId(
        toApiError('VALIDATION_ERROR', 'Validation error', { issues: err.issues }),
        requestId,
      );
      return reply.code(400).send(res);
    }

    // Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        const res: ApiErrorResponse = withRequestId(
          toApiError('CONFLICT', 'Unique constraint failed', { details: err.meta }),
          requestId,
        );
        return reply.code(409).send(res);
      }
      if (err.code === 'P2025') {
        const res: ApiErrorResponse = withRequestId(toApiError('NOT_FOUND', 'Record not found'), requestId);
        return reply.code(404).send(res);
      }

      const res: ApiErrorResponse = withRequestId(
        toApiError('BAD_REQUEST', 'Database request error', { details: { code: err.code, meta: err.meta } }),
        requestId,
      );
      return reply.code(400).send(res);
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
      const res: ApiErrorResponse = withRequestId(toApiError('BAD_REQUEST', 'Database validation error'), requestId);
      return reply.code(400).send(res);
    }

    // Fastify/http-ish errors
    const e = (isFastifyError(err) ? (err as unknown as ErrorLike) : ({} as ErrorLike));
    const status = typeof e.statusCode === 'number' ? e.statusCode : 500;

    const message = typeof e.message === 'string' && e.message.trim() ? e.message : 'Internal Server Error';

    let code: ApiErrorCode = 'INTERNAL_ERROR';
    if (status === 400) code = 'BAD_REQUEST';
    if (status === 401) code = 'UNAUTHORIZED';
    if (status === 403) code = 'FORBIDDEN';
    if (status === 404) code = 'NOT_FOUND';
    if (status === 409) code = 'CONFLICT';

    const res: ApiErrorResponse = withRequestId(toApiError(code, message), requestId);

    // Log unknown/unhandled errors server-side.
    if (status >= 500) {
      app.log.error({ err }, 'Unhandled error');
    }

    return reply.code(status).send(res);
  });
};
