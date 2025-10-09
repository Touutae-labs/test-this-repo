
export enum TopupStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
export class Topup {
  referenceId: string;
  walletId: string;
  amount: number;
  currency: string;

  constructor(partial: Partial<Topup>) {
    Object.assign(this, partial);
  }
}

export class TopupResponse {
  requestId: string;
  referenceId: string;
  walletId: string;
  amount: number;
  currency: string;
  status: TopupStatus
  statusMessage?: string;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<TopupResponse>) {
    Object.assign(this, partial);
  }
}