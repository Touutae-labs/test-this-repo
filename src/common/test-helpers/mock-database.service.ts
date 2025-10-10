/**
 * Mock Database Service for testing
 * Provides mock database methods that repositories can use
 */
export class MockDatabaseService {
  get = jest.fn();
  all = jest.fn();
  run = jest.fn();
  getDatabase = jest.fn();
}
