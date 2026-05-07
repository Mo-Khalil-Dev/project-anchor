import { BankConnection } from './bankConnection';
import { BANK_CONNECTION_STATUS } from './bank-connection-status';

describe('BankConnection Entity', () => {
  const mockCustomerId = 'customer-123';
  const mockOAuthState = 'state-token-456';

  describe('Factory Method - create()', () => {
    it('should generate unique UUID for each instance', () => {
      const conn1 = BankConnection.create(mockCustomerId, mockOAuthState);
      const conn2 = BankConnection.create(mockCustomerId, mockOAuthState);

      expect(conn1.id).toBeDefined();
      expect(conn2.id).toBeDefined();
      expect(conn1.id).not.toBe(conn2.id);
      // UUID v4 format check
      expect(conn1.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should initialize with PENDING status', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      expect(connection.getStatus).toBe(BANK_CONNECTION_STATUS.PENDING);
    });

    it('should initialize date fields correctly', () => {
      const beforeCreation = new Date();
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);
      const afterCreation = new Date();

      expect(connection.getConnectedAt).toBeNull();
      expect(connection.getDataRetrievedAt).toBeNull();
      expect(connection.createdAt).toBeInstanceOf(Date);
      expect(connection.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime()
      );
      expect(connection.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime()
      );
      expect(connection.getUpdatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Getter Methods', () => {
    it('should return customerId from factory', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      expect(connection.getCustomerId).toBe(mockCustomerId);
    });

    it('should return oauthState from factory', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      expect(connection.getOauthState).toBe(mockOAuthState);
    });

    it('should return current status', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      expect(connection.getStatus).toBe(BANK_CONNECTION_STATUS.PENDING);
    });

    it('should initialize connectedAt as null', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      expect(connection.getConnectedAt).toBeNull();
    });
  });

  describe('markConnected()', () => {
    it('should set connectedAt to current date', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);
      const beforeMark = new Date();

      connection.markConnected();

      const afterMark = new Date();
      expect(connection.getConnectedAt).toBeInstanceOf(Date);
      expect(connection.getConnectedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeMark.getTime()
      );
      expect(connection.getConnectedAt!.getTime()).toBeLessThanOrEqual(
        afterMark.getTime()
      );
    });

    it('should update updatedAt timestamp', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);
      const beforeMark = new Date();

      connection.markConnected();

      const afterMark = new Date();
      expect(connection.getUpdatedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeMark.getTime()
      );
      expect(connection.getUpdatedAt!.getTime()).toBeLessThanOrEqual(
        afterMark.getTime()
      );
    });

    it('should not change status when marking connected', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      connection.markConnected();

      expect(connection.getStatus).toBe(BANK_CONNECTION_STATUS.PENDING);
    });
  });

  describe('markDataRetrieved()', () => {
    it('should change status from PENDING to DATA_RETRIEVED', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);
      expect(connection.getStatus).toBe(BANK_CONNECTION_STATUS.PENDING);

      connection.markDataRetrieved();

      expect(connection.getStatus).toBe(BANK_CONNECTION_STATUS.DATA_RETRIEVED);
    });

    it('should set dataRetrievedAt timestamp', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);
      const beforeMark = new Date();

      connection.markDataRetrieved();

      const afterMark = new Date();
      expect(connection.getDataRetrievedAt).toBeInstanceOf(Date);
      expect(connection.getDataRetrievedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeMark.getTime()
      );
      expect(connection.getDataRetrievedAt!.getTime()).toBeLessThanOrEqual(
        afterMark.getTime()
      );
    });

    it('should lazy-set connectedAt if null', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);
      expect(connection.getConnectedAt).toBeNull();
      const beforeMark = new Date();

      connection.markDataRetrieved();

      const afterMark = new Date();
      expect(connection.getConnectedAt).toBeInstanceOf(Date);
      expect(connection.getConnectedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeMark.getTime()
      );
      expect(connection.getConnectedAt!.getTime()).toBeLessThanOrEqual(
        afterMark.getTime()
      );
    });

    it('should update updatedAt timestamp', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);
      const beforeMark = new Date(Date.now() + 1);

      connection.markDataRetrieved();

      const afterMark = new Date();
      expect(connection.getUpdatedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeMark.getTime()
      );
      expect(connection.getUpdatedAt!.getTime()).toBeLessThanOrEqual(
        afterMark.getTime()
      );
    });
  });

  describe('disconnect()', () => {
    it('should change status to DISCONNECTED', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      connection.disconnect();

      expect(connection.getStatus).toBe(BANK_CONNECTION_STATUS.DISCONNECTED);
    });

    it('should update updatedAt timestamp', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);
      const beforeDisconnect = new Date(Date.now() + 1);

      connection.disconnect();

      const afterDisconnect = new Date();
      expect(connection.getUpdatedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeDisconnect.getTime()
      );
      expect(connection.getUpdatedAt!.getTime()).toBeLessThanOrEqual(
        afterDisconnect.getTime()
      );
    });
  });

  describe('Immutability & Invariants', () => {
    it('should not allow reassignment of customerId', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      // Access should work
      expect(connection.getCustomerId).toBe(mockCustomerId);

      // Attempting to modify the underlying property should fail (readonly)
      expect(() => {
        (connection as any).customerId = 'new-customer-id';
      }).toThrow();
    });

    it('should not allow reassignment of oauthState', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      // Access should work
      expect(connection.getOauthState).toBe(mockOAuthState);

      // Attempting to modify the underlying property should fail (readonly)
      expect(() => {
        (connection as any).oauthState = 'new-state';
      }).toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle calling markDataRetrieved() twice', async () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      connection.markDataRetrieved();
      const firstDataRetrievedAt = connection.getDataRetrievedAt;

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 10));

      connection.markDataRetrieved();
      const secondDataRetrievedAt = connection.getDataRetrievedAt;

      // Second call should update the timestamp
      expect(secondDataRetrievedAt!.getTime()).toBeGreaterThanOrEqual(
        firstDataRetrievedAt!.getTime()
      );
    });
  });

  describe('Aggregate Root Behavior', () => {
    it('should initialize with no domain events', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      expect(connection.getDomainEvents()).toHaveLength(0);
    });

    it('should have initial version of 1', () => {
      const connection = BankConnection.create(mockCustomerId, mockOAuthState);

      expect(connection.getVersion()).toBe(1);
    });

    it('should maintain entity equality by id', () => {
      const connection1 = BankConnection.create(mockCustomerId, mockOAuthState);

      // Create a second instance with different id (simulating reconstruction from persistence)
      const connection2 = BankConnection.create(mockCustomerId, mockOAuthState);

      // Different instances, different ids
      expect(connection1.equals(connection2)).toBe(false);
    });
  });
});
