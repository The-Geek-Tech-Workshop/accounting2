import { QueryDocumentSnapshot } from "firebase/firestore/lite";

export type EtsyConfig = {
  keystring: string;
  sharedSecret: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export const etsyConfigConverter = {
  toFirestore: (config: EtsyConfig) => {
    return {
      keystring: config.keystring,
      sharedSecret: config.sharedSecret,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      expiresAt: config.expiresAt,
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot): EtsyConfig => {
    const data = snapshot.data();
    return {
      keystring: data.keystring,
      sharedSecret: data.sharedSecret,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
    };
  },
};
