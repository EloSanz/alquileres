import { Elysia } from 'elysia'
import { BaseException } from '../exceptions/BaseException'
import { logError } from '../utils/logger'

export const errorPlugin = new Elysia()
  .onError(({ code, error, set, request }) => {
    // Handle custom exceptions
    if (error instanceof BaseException) {
      set.status = error.statusCode
      logError(`Custom exception: ${error.message}`, error, {
        code: error.code,
        statusCode: error.statusCode,
        url: request.url,
        method: request.method
      })
      return error.toJSON()
    }

    // Handle Elysia built-in errors
    switch (code) {
      case 'VALIDATION':
        set.status = 400
        return {
          success: false,
          message: 'Validation error',
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          errors: error.all,
          timestamp: new Date().toISOString()
        }
      case 'NOT_FOUND':
        set.status = 404
        return {
          success: false,
          message: 'Resource not found',
          statusCode: 404,
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString()
        }
      default:
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        logError('Unhandled server error', error instanceof Error ? error : undefined, {
          code,
          url: request.url,
          method: request.method
        })
        set.status = 500
        return {
          success: false,
          message: errorMessage,
          statusCode: 500,
          code: 'INTERNAL_ERROR',
          timestamp: new Date().toISOString()
        }
    }
  })
