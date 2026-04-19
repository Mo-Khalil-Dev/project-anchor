import { randomUUID } from 'crypto';

export type BankConnectionStatus = 'PENDING' | 'DATA_RETRIEVED' | 'DISCONNECTED';

export class BankConnection {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly oauthState: string,
    public status: BankConnectionStatus,
    public connectedAt: Date | null = null,
    public dataRetrievedAt: Date | null = null,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  static create(customerId: string, oauthState: string): BankConnection {
    return new BankConnection(
      randomUUID(),
      customerId,
      oauthState,
      'PENDING'
    );
  }

  markDataRetrieved(): void {
    this.status = 'DATA_RETRIEVED';
    this.connectedAt = new Date();
    this.dataRetrievedAt = new Date();
    this.updatedAt = new Date();
  }

  disconnect(): void {
    this.status = 'DISCONNECTED';
    this.updatedAt = new Date();
  }
}
