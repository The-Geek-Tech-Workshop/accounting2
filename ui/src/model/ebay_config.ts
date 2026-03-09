import { QueryDocumentSnapshot } from "firebase/firestore/lite";

export type EbayConfig = {
  clientId: string;
  certId: string;
  ruName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshTokenExpiresAt: number;
};

export const ebayConfigConverter = {
  toFirestore: (config: EbayConfig) => ({ ...config }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): EbayConfig => {
    const data = snapshot.data();
    return {
      clientId: data.clientId,
      certId: data.certId,
      ruName: data.ruName,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    };
  },
};
