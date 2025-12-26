import winston from 'winston';
import { Elysia } from 'elysia';

// Define colors for different log levels and HTTP status codes
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
  success: 'cyan',
  request: 'blue',
  response: 'green'
};

winston.addColors(colors);

// Create custom format for HTTP requests/responses
const httpFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, method, url, statusCode, duration, userId, username, requestId, ip, ...meta }) => {
    // Format: TIMESTAMP LEVEL [RequestID] METHOD URL → STATUS (DURATIONms) [User: USERNAME] [IP] MESSAGE
    let log = `${timestamp} ${level}:`;

    // Request ID for correlation (short format for readability)
    if (requestId && typeof requestId === 'string') {
      log += ` [${requestId.substring(0, 8)}]`;
    }

    // Method and URL
    if (method && url) {
      log += ` ${method} ${url}`;
    }

    // Status code with color coding
    if (typeof statusCode === 'number') {
      let statusColor = '\x1b[37m'; // white default
      if (statusCode >= 200 && statusCode < 300) statusColor = '\x1b[32m'; // green
      else if (statusCode >= 300 && statusCode < 400) statusColor = '\x1b[36m'; // cyan
      else if (statusCode >= 400 && statusCode < 500) statusColor = '\x1b[33m'; // yellow
      else if (statusCode >= 500) statusColor = '\x1b[31m'; // red

      log += ` → ${statusColor}${statusCode}\x1b[0m`; // reset color
    }

    // Duration
    if (duration) {
      log += ` (${duration}ms)`;
    }

    // User information (username preferred, fallback to userId)
    if (username) {
      log += ` [User: ${username}]`;
    } else if (userId) {
      log += ` [User ID: ${userId}]`;
    }

    // IP address (if available)
    if (ip) {
      log += ` [IP: ${ip}]`;
    }

    // Message
    log += ` ${message}`;

    // Additional metadata (only if there's extra data beyond what we've already shown)
    const shownKeys = ['method', 'url', 'statusCode', 'duration', 'userId', 'username', 'requestId', 'ip'];
    const extraMeta = Object.keys(meta).filter(key => !shownKeys.includes(key));
    if (extraMeta.length > 0) {
      const extraData: any = {};
      extraMeta.forEach(key => { extraData[key] = meta[key]; });
      log += ` ${JSON.stringify(extraData)}`;
    }

    return log;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'http'),
  format: httpFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        httpFormat
      )
    }),
    // In production, you might want to add file transport
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      })
    ] : [])
  ]
});

// Helper functions for different types of logs
export const logRequest = (method: string, url: string, userId?: number, username?: string, requestId?: string, ip?: string) => {
  logger.http(`Request started`, { method, url, userId, username, requestId, ip });
};

export const logResponse = (method: string, url: string, statusCode: number, duration: number, userId?: number, username?: string, requestId?: string, ip?: string) => {
  logger.http(`Response`, { method, url, statusCode, duration, userId, username, requestId, ip });
};

export const logRequestBody = (method: string, url: string, body: string, requestId?: string, username?: string) => {
  const truncatedBody = body.length > 500 ? body.substring(0, 500) + '...' : body;
  logger.debug(`Request body`, { method, url, body: truncatedBody, requestId, username });
};

export const logError = (message: string, error?: any, meta?: any) => {
  logger.error(message, { error: error?.message || error, ...meta });
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Elysia middleware for automatic request/response logging
export const requestLogger = new Elysia({ name: 'request-logger' })
  .derive({ as: 'global' }, () => ({
    startTime: Date.now()
  }))
  .onBeforeHandle(({ request, headers }: any) => {
    const method = request.method;
    const url = request.url.replace(request.origin || '', '');
    const authHeader = headers.authorization;

    // Extract userId from JWT if available
    let userId: number | undefined;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        userId = payload.userId;
      } catch (e) {
        // Ignore decode errors - userId will remain undefined
      }
    }

    logRequest(method, url, userId);
  })
  .onAfterHandle(({ request, startTime, set }: any) => {
    const method = request.method;
    const url = request.url.replace(request.origin || '', '');
    const duration = Date.now() - startTime;
    const statusCode = set.status || 200;

    logResponse(method, url, statusCode, duration);
  })
  .onError(({ request, startTime, error, set }: any) => {
    const method = request.method;
    const url = request.url.replace(request.origin || '', '');
    const duration = Date.now() - startTime;
    const statusCode = set.status || 500;

    logError(`Request failed: ${error.message}`, error, {
      method,
      url,
      statusCode,
      duration
    });
  });

export default logger;
