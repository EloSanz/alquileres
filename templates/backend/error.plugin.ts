import { Elysia } from 'elysia'

export const errorPlugin = new Elysia()
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = 400
        return {
          success: false,
          message: 'Validation error',
          statusCode: 400,
          errors: error.all,
          timestamp: new Date().toISOString()
        }
      case 'NOT_FOUND':
        set.status = 404
        return {
          success: false,
          message: 'Resource not found',
          statusCode: 404,
          timestamp: new Date().toISOString()
        }
      default:
        console.error('Server error:', error)
        set.status = 500
        return {
          success: false,
          message: 'Internal server error',
          statusCode: 500,
          timestamp: new Date().toISOString()
        }
    }
  })
