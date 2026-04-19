import { randomUUID } from 'crypto';

export type BankConnectionStatus = 'PENDING' | 'AUTHORIZED' | 'DATA_RETRIEVED' | 'DISCONNECTED';

export class BankConnection {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly oauthState: string,
    public status: BankConnectionStatus,
    public reportJobId: string | null = null,
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

  markAuthorized(reportJobId: string): void {
    this.status = 'AUTHORIZED';
    this.reportJobId = reportJobId;
    this.connectedAt = new Date();
    this.updatedAt = new Date();
  }

  markDataRetrieved(): void {
    this.status = 'DATA_RETRIEVED';
    this.dataRetrievedAt = new Date();
    this.updatedAt = new Date();
  }

  disconnect(): void {
    this.status = 'DISCONNECTED';
    this.updatedAt = new Date();
  }
}
