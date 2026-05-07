import { randomUUID } from 'crypto';
import { AggregateRoot } from '@/core/domain/common/AggregateRoot';
import {
  BANK_CONNECTION_STATUS,
  BankConnectionStatus,
} from '@/features/bankConnection/domain/entites/bank-connection-status';

export interface BankConnectionProps {
  id: string;
  customerId: string;
  oauthState: string;
  status: BankConnectionStatus;
  connectedAt: Date | null;
  dataRetrievedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
export class BankConnection extends AggregateRoot<string> {
  private readonly customerId: string;
  private readonly oauthState: string;
  private status: BankConnectionStatus;
  private connectedAt: Date | null;
  private updatedAt: Date | null;
  private dataRetrievedAt: Date | null;
  private constructor(props: BankConnectionProps) {
    super(props.id, props.createdAt);
    this.customerId = props.customerId;
    this.oauthState = props.oauthState;
    this.status = props.status;
    this.connectedAt = props.connectedAt;
    this.dataRetrievedAt = props.dataRetrievedAt;
    this.updatedAt = props.updatedAt;
  }

  get getCustomerId(): string {
    return this.customerId;
  }

  get getOauthState(): string {
    return this.oauthState;
  }

  get getStatus(): BankConnectionStatus {
    return this.status;
  }

  get getConnectedAt(): Date | null {
    return this.connectedAt;
  }

  get getUpdatedAt(): Date | null {
    return this.updatedAt;
  }

  get getDataRetrievedAt(): Date | null {
    return this.dataRetrievedAt;
  }

  static create(customerId: string, oauthState: string): BankConnection {
    const now = new Date();
    const connection = new BankConnection({
      id: randomUUID(),
      customerId,
      oauthState,
      status: BANK_CONNECTION_STATUS.PENDING,
      connectedAt: null,
      dataRetrievedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    return connection;
  }

  markDataRetrieved(): void {
    this.status = BANK_CONNECTION_STATUS.DATA_RETRIEVED;
    if (!this.connectedAt) {
      this.connectedAt = new Date();
    }
    this.dataRetrievedAt = new Date();
    this.updatedAt = new Date();
  }

  markConnected(): void {
    this.connectedAt = new Date();
    this.updatedAt = new Date();
  }

  disconnect(): void {
    this.status = BANK_CONNECTION_STATUS.DISCONNECTED;
    this.updatedAt = new Date();
  }
}
