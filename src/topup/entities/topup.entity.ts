export enum TopupStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class Topup {
  id: string;
  userId: string;
  amount: number;
  status: TopupStatus;
  externalTransactionId?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Topup>) {
    Object.assign(this, partial);
    this.status = this.status || TopupStatus.PENDING;
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = this.updatedAt || new Date();
  }
}

export class ExternalTopupRequestDto {
  referenceId: string;
  walletId: string;
  amount: number;
  currency: string;

  constructor(partial: Partial<Topup>) {
    Object.assign(this, partial);
  }
}

export class ExternalTopupResponseDto {
  requestId: string;
  referenceId: string;
  walletId: string;
  amount: number;
  currency: string;
  status: TopupStatus;
  statusMessage?: string;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ExternalTopupResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ExternalWebhookDto {
  requestId: string;
  referenceId: string;
  status: 'completed' | 'failed' | 'pending';
  statusMessage?: string;
  amount: number;
  currency: string;
  processedAt: Date;

  constructor(partial: Partial<ExternalWebhookDto>) {
    Object.assign(this, partial);
  }
}
