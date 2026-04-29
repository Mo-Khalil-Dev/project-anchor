import { randomUUID } from 'crypto';
import type { Result } from '../../shared/result';

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

export interface InitiateBankOAuthInput {
  redirectUri: string;
}

export interface InitiateBankOAuthOutput {
  authUrl: string;
  state: string;
}

export interface HandleBankOAuthCallbackInput {
  code: string;
  state: string;
}

export interface IncomeBreakdown {
  salary: number;
  pension: number;
  benefits: number;
  cashDeposits: number;
  other: number;
  total: number;
}

export interface ExpenseBreakdown {
  housing: number;
  food: number;
  utilities: number;
  transport: number;
  other: number;
  total: number;
}

export interface IBankConnectionRepository {
  save(connection: BankConnection): Promise<Result<BankConnection, Error>>;
  findById(id: string): Promise<Result<BankConnection | null, Error>>;
  findByCustomerId(customerId: string): Promise<Result<BankConnection | null, Error>>;
  findByOAuthState(state: string): Promise<Result<BankConnection | null, Error>>;
  findByJobId(jobId: string): Promise<Result<BankConnection | null, Error>>;
  update(connection: BankConnection): Promise<Result<BankConnection, Error>>;
}
