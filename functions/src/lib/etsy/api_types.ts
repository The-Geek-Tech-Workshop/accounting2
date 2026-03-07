export type {
  EtsyLedgerEntriesResponse,
  EtsyLedgerEntryRaw,
  EtsyPaymentAdjustmentRaw,
  EtsyPaymentAdjustmentItemRaw,
} from "@accounting2/shared";

export interface EtsyMe {
  readonly user_id: number;
  readonly shop_id: number;
}

export interface EtsyConfig {
  readonly keystring: string;
  readonly sharedSecret: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
  readonly shopId: number;
}

export interface EtsyTokenResponse {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in: number;
  readonly token_type: string;
}

export interface ExchangeTokenData {
  readonly code: string;
  readonly codeVerifier: string;
  readonly keystring: string;
  readonly sharedSecret: string;
  readonly redirectUri: string;
}
