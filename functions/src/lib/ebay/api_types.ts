export interface EbayConfig {
  readonly clientId: string;
  readonly certId: string;
  readonly ruName: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
  readonly refreshTokenExpiresAt: number;
  readonly signingKeyJwe?: string;
  readonly signingKeyPrivateKey?: string;
}

export interface EbayTransactionRaw {
  readonly transactionId: string;
  readonly transactionDate?: string;
  readonly transactionType?: string;
  readonly transactionMemo?: string;
  readonly bookingEntry?: "CREDIT" | "DEBIT";
  readonly orderId?: string;
  readonly amount?: { readonly value: string; readonly currency: string };
  readonly [key: string]: unknown;
}

export interface EbayPayoutRaw {
  readonly payoutId: string;
  readonly payoutDate: string;
  readonly payoutStatus: string;
  readonly payoutStatusDescription?: string;
  readonly amount: { readonly value: string; readonly currency: string };
  readonly payoutInstrument?: {
    readonly accountLastFourDigits?: string;
    readonly instrumentType?: string;
    readonly nickname?: string;
  };
  readonly bankReference?: string;
  readonly payoutMemo?: string;
  readonly transactionCount?: number;
}

export interface EbayLedgerEntry {
  readonly entryId: string;
  readonly entryDate: number;
  readonly description: string;
  readonly amount: number;
  readonly currency: string;
  readonly bookingEntry: "CREDIT" | "DEBIT";
  readonly recordType: "transaction" | "billing_activity" | "payout";
  readonly sourceId: string;
  readonly referenceId?: string;
}

export interface ExchangeEbayTokenData {
  readonly code: string;
  readonly clientId: string;
  readonly certId: string;
  readonly ruName: string;
}
