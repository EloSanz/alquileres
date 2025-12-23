// JWT Payload type used across all routes
export interface JWTPayload {
  userId: number;
  iat: number;
  exp: number;
}

// JWT Secret constant to ensure consistency across all files
export const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-secret-change-in-production';
