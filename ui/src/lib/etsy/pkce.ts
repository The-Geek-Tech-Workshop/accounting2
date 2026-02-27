import { fromUint8Array } from "js-base64";

export type PkceChallenge = {
  readonly verifier: string;
  readonly challenge: string;
};

export const generatePkce = async (): Promise<PkceChallenge> => {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = fromUint8Array(randomBytes, true);

  const encodedVerifier = new TextEncoder().encode(verifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedVerifier);
  const challenge = fromUint8Array(new Uint8Array(hashBuffer), true);

  return { verifier, challenge };
};
