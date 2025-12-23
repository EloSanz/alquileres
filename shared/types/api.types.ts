// Shared API types that can be imported by both server and client

// Response wrapper types
export interface SuccessResponse<T = any> {
  success: true
  message: string
  data: T
  timestamp: string
}

export interface ListResponse<T = any> {
  success: true
  message: string
  data: T[]
  count: number
  timestamp: string
}

export interface ErrorResponse {
  success: false
  message: string
  statusCode: number
  errors?: string[]
  timestamp: string
}

export type ApiResponse<T = any> = SuccessResponse<T> | ListResponse<T> | ErrorResponse

// Re-export common types that might be needed
export type { App } from '../../server/src/index'
