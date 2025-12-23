// Test setup file
import { beforeAll, afterAll } from 'vitest'

// Setup global test environment
beforeAll(async () => {
  // Setup code that runs before all tests
  console.log('🧪 Setting up test environment...')
})

afterAll(async () => {
  // Cleanup code that runs after all tests
  console.log('🧪 Cleaning up test environment...')
})
