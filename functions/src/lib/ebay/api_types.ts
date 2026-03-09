export interface EbayConfig {
  readonly clientId: string;
  readonly certId: string;
  readonly ruName: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
  readonly refreshTokenExpiresAt: number;
}

export interface ExchangeEbayTokenData {
  readonly code: string;
  readonly clientId: string;
  readonly certId: string;
  readonly ruName: string;
}
